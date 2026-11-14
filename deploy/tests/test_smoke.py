"""Permanent offline tests for LECTRA's cookie/CSRF deployment smoke protocol."""
import importlib.util
import json
import os
from pathlib import Path
import unittest
from unittest.mock import patch, MagicMock

spec = importlib.util.spec_from_file_location('smoke', Path(__file__).parents[1] / 'smoke_test.py')
smoke = importlib.util.module_from_spec(spec)
spec.loader.exec_module(smoke)


class FakeClient:
    def __init__(self, failure=None):
        self.calls, self.failure = [], failure

    def request(self, path, payload=None, csrf=None):
        self.calls.append((path, payload, csrf))
        if path == self.failure:
            raise ValueError('Synthetic failure')
        values = {'/api/health': {'data': {'status': 'ok'}}, '/api/ready': {'data': {'status': 'ready', 'db': 'connected'}},
                  '/api/auth/session': {'data': {'csrfToken': 'g' * 43}},
                  '/api/auth/login': {'data': {'csrfToken': 'a' * 43, 'user': {'id': 'synthetic-user'}}},
                  '/api/auth/me': {'data': {'user': {'id': 'synthetic-user'}}}, '/api/courses': {'data': {'items': []}}}
        return b'<html></html>' if path == '/' else b'' if path.endswith('/logout') else json.dumps(values[path]).encode()


class SmokeTests(unittest.TestCase):
    @patch.dict(os.environ, {}, clear=True)
    def test_public_checks_without_optional_credentials(self):
        client = FakeClient()
        smoke.check('https://demo.example.test', client)
        self.assertEqual([c[0] for c in client.calls], ['/api/health', '/api/ready', '/'])

    @patch.dict(os.environ, {}, clear=True)
    @patch.object(smoke.time, 'sleep')
    def test_bad_readiness_fails_after_bounded_retries(self, sleep):
        with self.assertRaisesRegex(RuntimeError, '/api/ready'):
            smoke.check('https://demo.example.test', FakeClient('/api/ready'))
        self.assertEqual(sleep.call_count, 4)

    @patch.dict(os.environ, {'SMOKE_EMAIL': 'synthetic@example.test', 'SMOKE_PASSWORD': 'test-only'}, clear=True)
    def test_cookie_bootstrap_login_rotation_context_and_logout(self):
        client = FakeClient()
        smoke.check('https://demo.example.test', client)
        login = next(c for c in client.calls if c[0].endswith('/login'))
        self.assertEqual(login[2], 'g' * 43)
        self.assertEqual(client.calls[-1], ('/api/auth/logout', {}, 'a' * 43))
        self.assertIn('/api/courses', [c[0] for c in client.calls])

    @patch.dict(os.environ, {'SMOKE_EMAIL': 'synthetic@example.test', 'SMOKE_PASSWORD': 'test-only'}, clear=True)
    def test_me_failure_still_logs_out_with_current_csrf(self):
        client = FakeClient('/api/auth/me')
        with self.assertRaisesRegex(RuntimeError, 'Authenticated smoke failed'):
            smoke.check('https://demo.example.test', client)
        self.assertEqual(client.calls[-1], ('/api/auth/logout', {}, 'a' * 43))

    @patch.dict(os.environ, {'SMOKE_EMAIL': 'synthetic@example.test'}, clear=True)
    def test_partial_credentials_fail_before_network(self):
        client = FakeClient()
        with self.assertRaisesRegex(RuntimeError, 'both'):
            smoke.check('https://demo.example.test', client)
        self.assertFalse(client.calls)

    def test_unsafe_target_is_rejected(self):
        for url in ['http://public.example.test', 'https://user:pass@example.test', 'https://example.test/path', 'https://example.test?key=value']:
            with self.subTest(url=url), self.assertRaises(ValueError):
                smoke.validated_origin(url)

    def test_http_transport_sends_origin_and_csrf_not_bearer(self):
        client = smoke.SessionClient('https://demo.example.test')
        response = MagicMock()
        response.__enter__.return_value.read.return_value = b'{}'
        with patch.object(client.opener, 'open', return_value=response) as opened:
            client.request('/api/auth/logout', {}, 'a' * 43)
        req = opened.call_args.args[0]
        self.assertEqual(req.get_header('Origin'), 'https://demo.example.test')
        self.assertEqual(req.get_header('X-csrf-token'), 'a' * 43)
        self.assertIsNone(req.get_header('Authorization'))


if __name__ == '__main__':
    unittest.main()
