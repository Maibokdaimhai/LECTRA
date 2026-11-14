"""Local Docker/Compose verification, macOS/Linux/WSL 2 only.

Creates isolated task-owned containers and volume. Never deploys to cloud or
deletes volumes. Stops its own containers after verification, retaining data.
Private env/cookies are stored only in an ignored mode-0700 directory.
"""
import argparse
import datetime
import hashlib
import http.client
import json
import os
import pathlib
import platform
import re
import secrets
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request

if sys.platform not in ('darwin', 'linux'):
    raise SystemExit('Use macOS or a Linux/WSL 2 shell with Docker Linux containers; native Windows Python is unsupported.')
parser = argparse.ArgumentParser()
parser.add_argument('--create-local-containers', action='store_true', required=True)
parser.add_argument('--evidence-dir')
args = parser.parse_args()
repo = pathlib.Path(__file__).resolve().parent.parent
stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d%H%M%S%f')
project = 'lectra-ep3-' + stamp
private = repo / '.local/episode3' / stamp
private.mkdir(parents=True, mode=0o700)
out = repo / args.evidence_dir if args.evidence_dir else private / 'evidence'
if (out / 'results.json').exists():
    raise SystemExit('Choose a new evidence directory; existing results are preserved.')
out.mkdir(parents=True, exist_ok=True)
password, secret, owner_password, student_password = [secrets.token_urlsafe(32) for _ in range(4)]
def free_port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]
web_port, api_port, unified_port = free_port(), free_port(), free_port()
origin = f'http://127.0.0.1:{web_port}'
api_image = 'lectra-api:ep3-' + stamp
web_image = 'lectra-web:ep3-' + stamp
unified_image = 'lectra-unified:ep3-' + stamp
env_file = private / 'compose.env'
values = {'POSTGRES_PASSWORD': password, 'SESSION_SECRET': secret, 'SEED_OWNER_PASSWORD': owner_password,
          'SEED_RESPONDENT_PASSWORD': student_password, 'APP_ORIGIN': origin, 'WEB_PORT': str(web_port),
          'API_PORT': str(api_port), 'API_IMAGE': api_image, 'WEB_IMAGE': web_image}
env_file.write_text(''.join(f'{k}={v}\n' for k, v in values.items()))
env_file.chmod(0o600)
base = {k: v for k, v in os.environ.items() if not k.startswith(('PG', 'COMPOSE_', 'SEED_', 'ALLOW_', 'DATABASE_', 'TEST_DATABASE', 'APP_ORIGIN', 'SESSION_SECRET', 'NODE_ENV', 'TRUST_PROXY', 'PORT', 'API_IMAGE', 'WEB_IMAGE'))}
base['NO_COLOR'] = '1'
compose = ['docker', 'compose', '--env-file', str(env_file), '-p', project]
rows = []
checks = []
images = {}
head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=repo, text=True).strip()
paths = subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard'], cwd=repo, text=True).splitlines()
hashes = {p: hashlib.sha256((repo / p).read_bytes()).hexdigest() for p in sorted(set(paths)) if (repo / p).is_file()
          and (p.startswith(('apps/', 'scripts/', 'prisma/')) or p in ['Dockerfile', '.dockerignore', 'docker-compose.yml', 'package.json', 'package-lock.json', '.env.example'] or p.startswith(('tsconfig', 'prisma.config')))}
environment = {'system': platform.system(), 'machine': platform.machine(), 'python': platform.python_version(),
               'macOSVersion': platform.mac_ver()[0] if sys.platform == 'darwin' else None}
def save():
    (out / 'results.json').write_text(json.dumps({'baseCommit': head, 'environment': environment, 'sourceHashes': hashes,
        'commands': rows, 'checks': checks, 'images': images, 'project': project}, indent=2) + '\n')
def redact(text):
    for value in [password, secret, owner_password, student_password]:
        text = text.replace(value, '[REDACTED]')
    return text
def capture(command, env=None):
    return subprocess.run(command, cwd=repo, env=env or base, capture_output=True, text=True)
def run(label, command, env=None):
    p = capture(command, env)
    (out / (label + '.txt')).write_text(redact(p.stdout + p.stderr))
    rows.append({'label': label, 'command': [str(x).replace(str(private), '<private-local-directory>') for x in command], 'exit': p.returncode})
    save()
    print(label + ': exit ' + str(p.returncode), flush=True)
    if p.returncode:
        raise RuntimeError('Verification failed: ' + label + '; inspect sanitized log.')
    return p.stdout
def check(label, condition):
    if not condition:
        raise AssertionError(label)
    checks.append({'name': label, 'result': 'PASS'})
    save()
    print('PASS: ' + label, flush=True)
def sql(query):
    p = capture(compose + ['exec', '-T', 'db', 'psql', '-U', 'lectra', '-d', 'lectra_demo', '-At', '-c', query])
    if p.returncode:
        raise RuntimeError('Local verification SQL failed; no credentials/results printed.')
    return p.stdout.strip()
class Client:
    def __init__(self, base_url, browser_origin, forwarded=False):
        self.base, self.origin, self.forwarded, self.cookie, self.csrf = base_url, browser_origin, forwarded, '', ''
    def call(self, method, path, payload=None, expected=200):
        headers = {'Accept': 'application/json'}
        if self.forwarded:
            headers['X-Forwarded-Proto'] = 'https'
        if self.cookie:
            headers['Cookie'] = self.cookie
        if method != 'GET':
            headers.update({'Origin': self.origin, 'Content-Type': 'application/json', 'X-CSRF-Token': self.csrf})
        request = urllib.request.Request(self.base + path, data=None if payload is None else json.dumps(payload).encode(), method=method, headers=headers)
        try:
            res = urllib.request.urlopen(request, timeout=10)
        except urllib.error.HTTPError as error:
            res = error
        if res.status != expected:
            raise AssertionError(f'{method} {path}: expected {expected}, received {res.status}')
        raw = res.read()
        result = json.loads(raw) if raw else {}
        if res.headers.get('Set-Cookie'):
            self.cookie = res.headers['Set-Cookie'].split(';')[0]
        return result.get('data', result), res.headers
    def login(self, email, password):
        boot, _ = self.call('GET', '/api/auth/session')
        self.csrf = boot['csrfToken']
        logged, headers = self.call('POST', '/api/auth/login', {'email': email, 'password': password})
        self.csrf = logged['csrfToken']
        return logged, headers
def wait_ready(url):
    for _ in range(120):
        try:
            with urllib.request.urlopen(url + '/api/ready', timeout=2) as r:
                if r.status == 200:
                    return
        except (urllib.error.URLError, TimeoutError, ConnectionError, http.client.RemoteDisconnected):
            pass
        time.sleep(0.5)
    raise RuntimeError('Packaged API readiness timeout.')
def browser(phase):
    run('browser-' + phase, ['node', 'scripts/verify-docker-browser.mjs'], {**base,
        'PLAYWRIGHT_BROWSERS_PATH': str(repo / '.local/playwright-browsers'), 'EP3_BASE_URL': origin,
        'EP3_EVIDENCE_DIR': str(out), 'EP3_BROWSER_STATE_FILE': str(private / 'browser.json'),
        'EP3_BROWSER_PHASE': phase, 'SEED_OWNER_PASSWORD': owner_password})
def snapshot():
    query = '''SELECT jsonb_build_object(
      'surveys',(SELECT jsonb_agg(to_jsonb(s) ORDER BY id) FROM "Survey" s),
      'participation',(SELECT jsonb_agg(to_jsonb(p) ORDER BY "surveyId","studentId") FROM "Participation" p),
      'bundles',(SELECT jsonb_agg(to_jsonb(b) ORDER BY id) FROM "ResponseBundle" b),
      'answers',(SELECT jsonb_agg(to_jsonb(a) ORDER BY "bundleId","questionId") FROM "Answer" a))'''
    return hashlib.sha256(sql(query).encode()).hexdigest()

root_name = project + '-unified'
root_created = False
try:
    for tool, command in [('node', ['node', '--version']), ('npm', ['npm', '--version']),
                          ('docker', ['docker', 'version', '--format', '{{.Client.Version}}/{{.Server.Version}}']),
                          ('compose', ['docker', 'compose', 'version', '--short'])]:
        environment[tool] = run('version-' + tool, command).strip()
    check('Pinned Node/npm selected', environment['node'] == 'v24.22.1' and environment['npm'] == '10.9.2')
    run('compose-config', compose + ['config', '--quiet'])
    run('compose-build', compose + ['build'])
    run('unified-build', ['docker', 'build', '--progress', 'plain', '-t', unified_image, '.'])
    for label, image in [('api', api_image), ('web', web_image), ('unified', unified_image)]:
        metadata = json.loads(capture(['docker', 'image', 'inspect', image]).stdout)[0]
        images[label] = {'id': metadata['Id'], 'user': metadata['Config']['User'], 'architecture': metadata['Architecture']}
        check(label + ' image uses non-root identity', metadata['Config']['User'] in ('node', 'nginx'))
        image_environment = '\n'.join(metadata['Config'].get('Env') or [])
        history = capture(['docker', 'history', '--no-trunc', image]).stdout
        check(label + ' image metadata/history contains no generated runtime secrets', all(v not in image_environment + history for v in [password, secret, owner_password, student_password]))
    run('image-tools', ['docker', 'run', '--rm', '--entrypoint', 'node', unified_image, '-e', "const fs=require('node:fs');for(const p of ['/app/apps/api/dist/server.js','/app/apps/web/dist/index.html','/app/prisma/schema.prisma','/app/scripts/production-database.ts','/app/node_modules/prisma/build/index.js','/app/node_modules/tsx/dist/loader.mjs'])if(!fs.existsSync(p))throw Error('Missing runtime file');for(const p of ['/app/.env','/app/.local','/app/docs','/app/tests'])if(fs.existsSync(p))throw Error('Unexpected private/test path');console.log('Runtime tools and SPA present; private/config/test paths absent; uid='+process.getuid());"])
    run('compose-up', compose + ['up', '-d'])
    wait_ready(origin)
    states_raw = run('compose-state', compose + ['ps', '-a', '--format', 'json'])
    states = json.loads(states_raw) if states_raw.lstrip().startswith('[') else [json.loads(x) for x in states_raw.splitlines() if x.strip()]
    by_service = {x['Service']: x for x in states}
    check('db/server/client running; migrate exited 0', all(by_service[s]['State'] == 'running' for s in ['db', 'server', 'client']) and by_service['migrate']['State'] == 'exited' and by_service['migrate']['ExitCode'] == 0)
    check('Startup migration does not auto-seed', sql('SELECT count(*) FROM "User"') == '0')
    run('explicit-seed', compose + ['run', '--rm', 'migrate', 'npm', 'run', 'db:seed:production'])
    check('Explicit seed creates seven synthetic accounts', sql('SELECT count(*) FROM "User"') == '7')
    user = Client(origin, origin)
    check('Health and readiness respond through nginx', user.call('GET', '/api/health')[0]['status'] == 'ok' and user.call('GET', '/api/ready')[0]['status'] == 'ready')
    with urllib.request.urlopen(origin) as response:
        html = response.read().decode()
    check('Built web HTML and referenced asset served by nginx', bool(re.search(r'<script[^>]+src="([^"]+)"', html)))
    asset = re.search(r'<script[^>]+src="([^"]+)"', html).group(1)
    with urllib.request.urlopen(origin + asset) as response:
        check('Packaged JavaScript asset is served', response.status == 200 and 'javascript' in response.headers['Content-Type'])
    owner = Client(origin, origin)
    owner.login('owner.1@example.test', owner_password)
    student = Client(origin, origin)
    student.login('respondent.11@example.test', student_password)
    lecture = '16000000-0000-4000-8000-000000000302'
    draft, _ = owner.call('POST', '/api/surveys', {'lectureId': lecture}, 201)
    draft, _ = owner.call('PATCH', '/api/surveys/' + draft['id'], {'expectedRevision': 1, 'title': 'Episode 3 container feedback', 'questions': [
        {'id': None, 'type': 'RATING', 'prompt': 'Container clarity', 'required': True, 'ratingScale': {'min': 1, 'max': 5, 'minLabel': 'Low', 'maxLabel': 'High', 'interpretation': 'Higher means clearer'}},
        {'id': None, 'type': 'TEXT', 'prompt': 'Next lecture', 'required': False, 'ratingScale': None}]})
    survey, _ = owner.call('POST', '/api/surveys/' + draft['id'] + '/publish', {'expectedRevision': draft['definitionRevision']})
    path = '/api/surveys/' + survey['id']
    student.call('POST', path + '/responses', {'answers': []}, 422)
    answers = {'answers': [{'questionId': survey['questions'][0]['id'], 'value': 4}, {'questionId': survey['questions'][1]['id'], 'value': 'Episode 3 persisted suggestion'}]}
    student.call('POST', path + '/responses', answers, 201)
    duplicate, _ = student.call('POST', path + '/responses', answers, 409)
    check('Real login/author/publish/required-validation/one-time feedback', duplicate['error']['code'] == 'RESPONSE_ALREADY_SUBMITTED')
    owner.call('POST', path + '/close', {})
    me, _ = owner.call('GET', '/api/auth/me')
    results, _ = owner.call('GET', path + '/results')
    submission, _ = student.call('GET', path + '/my-submission')
    check('Closed owner results contain stored feedback', results['responseCount'] == 1 and results['questions'][1]['comments'] == ['Episode 3 persisted suggestion'])
    browser('before')
    before_digest = snapshot()
    network = project + '_default'
    root_env = private / 'unified.env'
    root_env.write_text(f'NODE_ENV=production\nPORT=8087\nAPP_ORIGIN=https://lectra.example.test\nDATABASE_URL=postgresql://lectra:{password}@db:5432/lectra_demo\nSESSION_SECRET={secret}\nTRUST_PROXY=1\n')
    root_env.chmod(0o600)
    run('unified-up', ['docker', 'run', '-d', '--name', root_name, '--network', network, '--env-file', str(root_env), '-p', f'127.0.0.1:{unified_port}:8087', unified_image])
    root_created = True
    unified_url = f'http://127.0.0.1:{unified_port}'
    wait_ready(unified_url)
    with urllib.request.urlopen(unified_url) as response:
        check('Unified production image serves SPA on supplied PORT', response.status == 200 and '<div id="root">' in response.read().decode())
    prod = Client(unified_url, 'https://lectra.example.test', forwarded=True)
    _, cookie_headers = prod.login('owner.1@example.test', owner_password)
    check('Unified production login issues secure host cookie under simulated TLS termination', '__Host-lectra.sid=' in cookie_headers['Set-Cookie'] and 'Secure' in cookie_headers['Set-Cookie'])
    root_results, _ = prod.call('GET', path + '/results')
    check('Unified API reads the same persisted domain data', root_results == results)
    missing, headers = prod.call('GET', '/api/not-found', expected=404)
    check('Unified API misses remain JSON', missing['error']['code'] == 'NOT_FOUND' and 'application/json' in headers['Content-Type'])
    run('unified-stop', ['docker', 'stop', '--time', '10', root_name])
    root_state = json.loads(capture(['docker', 'inspect', root_name]).stdout)[0]['State']
    check('Unified PID 1 exits gracefully on SIGTERM', root_state['ExitCode'] == 0)
    run('unified-remove-container', ['docker', 'rm', root_name])
    root_created = False
    run('compose-down-retain-volume', compose + ['down'])
    run('compose-up-existing-volume', compose + ['up', '-d'])
    wait_ready(origin)
    after_me, _ = owner.call('GET', '/api/auth/me')
    after_results, _ = owner.call('GET', path + '/results')
    after_submission, _ = student.call('GET', path + '/my-submission')
    check('Down/up retains session identity and absolute expiry', after_me == me)
    check('Down/up retains own submission and closed owner results', after_submission == submission and after_results == results)
    check('Down/up leaves database domain snapshot unchanged', before_digest == snapshot())
    check('Down/up does not duplicate seed users', sql('SELECT count(*) FROM "User"') == '7')
    browser('after')
    check('Browser resumes stored session and verifies saved results/logout after down/up', True)
    save()
finally:
    if root_created:
        capture(['docker', 'stop', '--time', '10', root_name])
    stopped = capture(compose + ['stop'])
    (out / 'cleanup.txt').write_text(redact(stopped.stdout + stopped.stderr))
    save()
    print('Stopped only task-owned containers; database volume and private local configuration retained.', flush=True)
