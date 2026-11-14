"""LECTRA deployment smoke client; offline tests mock all network access.

No categories/Bearer-token assumptions: real LECTRA uses a PostgreSQL cookie
session, guest CSRF bootstrap, Origin validation and rotated login CSRF.
Episode 4 tests this protocol offline; real HTTPS deployment is verified later.
"""
import http.cookiejar
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request


def validated_origin(base):
    url = urllib.parse.urlsplit(base)
    local = url.hostname in ('127.0.0.1', 'localhost', '::1')
    if not url.hostname or url.username or url.password or url.query or url.fragment or url.path not in ('', '/') or not (
            url.scheme == 'https' or url.scheme == 'http' and local):
        raise ValueError('Smoke target must be an HTTPS origin or local HTTP origin.')
    return base.rstrip('/')


def data(raw):
    value = json.loads(raw)
    if not isinstance(value, dict) or not isinstance(value.get('data'), dict):
        raise ValueError('Invalid LECTRA response envelope.')
    return value['data']


class SessionClient:
    def __init__(self, base):
        self.base = base
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))

    def request(self, path, payload=None, csrf=None):
        headers = {'Accept': 'application/json'}
        if payload is not None:
            headers.update({'Content-Type': 'application/json', 'Origin': self.base})
            if csrf:
                headers['X-CSRF-Token'] = csrf
        req = urllib.request.Request(self.base + path, headers=headers,
            data=json.dumps(payload).encode() if payload is not None else None)
        with self.opener.open(req, timeout=30) as response:
            return response.read()


def check(base, client=None):
    base = validated_origin(base)
    email, password = os.getenv('SMOKE_EMAIL'), os.getenv('SMOKE_PASSWORD')
    if bool(email) != bool(password):
        raise RuntimeError('Set both SMOKE_EMAIL and SMOKE_PASSWORD, or neither.')
    client = client or SessionClient(base)
    for path, predicate in (
        ('/api/health', lambda raw: data(raw).get('status') == 'ok'),
        ('/api/ready', lambda raw: data(raw).get('status') == 'ready' and data(raw).get('db') == 'connected'),
        ('/', lambda raw: b'<html' in raw.lower()),
    ):
        for attempt in range(5):
            try:
                if not predicate(client.request(path)):
                    raise ValueError('Unexpected smoke response.')
                break
            except (urllib.error.URLError, TimeoutError, ValueError):
                if attempt == 4:
                    raise RuntimeError('Smoke check failed: ' + path) from None
                time.sleep(3)
        print('PASS ' + path)
    if not email:
        print('SKIP optional authenticated smoke: no credentials configured')
        return
    csrf = None
    failed = False
    try:
        csrf = data(client.request('/api/auth/session'))['csrfToken']
        logged = data(client.request('/api/auth/login', {'email': email, 'password': password}, csrf))
        csrf = logged['csrfToken']
        me = data(client.request('/api/auth/me'))
        if me['user']['id'] != logged['user']['id']:
            raise ValueError('Authenticated identity differs.')
        if not isinstance(data(client.request('/api/courses')).get('items'), list):
            raise ValueError('Invalid owned/eligible context response.')
        print('PASS cookie login, authenticated identity and context read')
    except (urllib.error.URLError, TimeoutError, ValueError, KeyError, TypeError):
        failed = True
    finally:
        if csrf:
            try:
                client.request('/api/auth/logout', {}, csrf)
                print('PASS logout')
            except (urllib.error.URLError, TimeoutError, ValueError):
                failed = True
    if failed:
        raise RuntimeError('Authenticated smoke failed; no credentials or session values printed.') from None


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('Usage: python3 deploy/smoke_test.py SERVICE_URL')
    try:
        check(sys.argv[1])
    except (RuntimeError, ValueError) as error:
        sys.exit(str(error))
