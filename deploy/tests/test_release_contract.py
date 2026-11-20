"""Release sequencing and fail-closed gates; every gcloud invocation is a local stub."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
SHA = '1' * 40
DIGEST = 'asia-southeast1-docker.pkg.dev/release-test/lectra/lectra@sha256:' + 'a' * 64


class ReleaseContractTests(unittest.TestCase):
    def run_release(self, failure='', digest=DIGEST, url='https://lectra.example.run.app', descriptor=None, **extra):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            cloud = root / 'gcloud'
            cloud.write_text('''#!/bin/bash
# LECTRA_OFFLINE_TEST_STUB
printf '%s\\n' "$*" >> "$CALL_LOG"
case "$*" in
 'artifacts docker images describe '*) printf '%s\\n' "$TEST_DIGEST" ;;
 'run jobs update '*) [[ "$TEST_FAILURE" != job-update ]] ;;
 'run jobs execute '*) [[ "$TEST_FAILURE" != migrate ]] ;;
 'run services update-traffic '*) [[ "$TEST_FAILURE" != traffic ]] ;;
 'run services update '*) [[ "$TEST_FAILURE" != service ]] ;;
 'run services describe '*)
   if [[ "$*" == *--format=json* ]]; then printf '%s\\n' "$TEST_DESCRIPTOR";
   else printf '%s\\n' 'https://lectra-hashed-as.a.run.app'; fi ;;
 *) exit 99 ;;
esac
''')
            cloud.chmod(0o700)
            env = {**os.environ, 'PATH': temp + ':' + os.environ['PATH'],
                   'LECTRA_OFFLINE_STUB_DIR': temp, 'PROJECT_ID': 'release-test',
                   'REGION': 'asia-southeast1', 'IMAGE_TAG': SHA, 'ROLLBACK': 'false',
                   'SERVICE_NAME': 'lectra', 'MIGRATE_JOB_NAME': 'lectra-migrate',
                   'TEST_FAILURE': failure, 'TEST_DIGEST': digest, 'TEST_URL': url,
                   'TEST_DESCRIPTOR': json.dumps(descriptor if descriptor is not None else {
                       'status': {'url': 'https://lectra-hashed-as.a.run.app'},
                       'spec': {'template': {'spec': {'containers': [{'env': [{'name': 'APP_ORIGIN', 'value': url}]}]}}}}),
                   'CALL_LOG': str(root / 'calls'), 'GITHUB_ENV': str(root / 'env'), **extra}
            result = subprocess.run(['bash', str(ROOT / 'deploy/release.sh')], env=env,
                                    capture_output=True, text=True)
            calls = (root / 'calls').read_text().splitlines() if (root / 'calls').exists() else []
            output = (root / 'env').read_text() if (root / 'env').exists() else ''
            return result, calls, output

    def test_normal_release_orders_digest_migration_service_traffic_and_url(self):
        result, calls, output = self.run_release()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual([c.split(' --')[0].split(' ')[0:3] for c in calls], [
            ['artifacts', 'docker', 'images'], ['run', 'jobs', 'update'],
            ['run', 'jobs', 'execute'], ['run', 'services', 'update'],
            ['run', 'services', 'update-traffic'], ['run', 'services', 'describe']])
        self.assertIn('--wait', calls[2])
        for c in [calls[1], calls[3]]:
            self.assertIn('--image=' + DIGEST, c)
        self.assertIn('DEPLOYED_IMAGE=' + DIGEST, output)
        self.assertNotRegex('\n'.join(calls), r'users |secrets |seed|--set-env|--set-secrets|--service-account')

    def test_configured_login_origin_is_exported_not_hashed_service_alias(self):
        origin = 'https://lectra-123456789012.asia-southeast1.run.app'
        result, _, output = self.run_release(url=origin)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('SERVICE_URL=' + origin + '\n', output)
        self.assertNotIn('lectra-hashed', output)

    def test_missing_or_duplicate_origin_is_rejected_without_alias_fallback(self):
        for env in [[], [{'name': 'APP_ORIGIN', 'valueFrom': {'secretKeyRef': {'name': 'not-used'}}}],
                    [{'name': 'APP_ORIGIN', 'value': 'https://one.run.app'},
                     {'name': 'APP_ORIGIN', 'value': 'https://two.run.app'}]]:
            with self.subTest(env=env):
                descriptor = {'status': {'url': 'https://lectra-hashed-as.a.run.app'},
                              'spec': {'template': {'spec': {'containers': [{'env': env}]}}}}
                result, _, output = self.run_release(descriptor=descriptor)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(output, '')

    def test_invalid_or_foreign_digest_prevents_mutation(self):
        for digest in ['', DIGEST[:-1], DIGEST + 'x', DIGEST.replace('/release-test/', '/other/'), DIGEST + '\nINJECT=value']:
            with self.subTest(digest=digest):
                result, calls, output = self.run_release(digest=digest)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(len(calls), 1)
                self.assertEqual(output, '')

    def test_job_update_and_migration_failures_leave_service_untouched(self):
        for failure in ['job-update', 'migrate']:
            with self.subTest(failure=failure):
                result, calls, output = self.run_release(failure=failure)
                self.assertNotEqual(result.returncode, 0)
                self.assertFalse(any(c.startswith('run services ') for c in calls))
                self.assertEqual(output, '')

    def test_service_or_traffic_failure_does_not_report_success(self):
        for failure in ['service', 'traffic']:
            with self.subTest(failure=failure):
                result, calls, output = self.run_release(failure=failure)
                self.assertNotEqual(result.returncode, 0)
                self.assertFalse(any(c.startswith('run services describe ') for c in calls))
                self.assertEqual(output, '')

    def test_invalid_url_cannot_inject_workflow_environment(self):
        for url in ['', 'http://lectra.example.run.app', 'https://lectra.example.run.app\nINJECT=value']:
            with self.subTest(url=url):
                result, _, output = self.run_release(url=url)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(output, '')

    def test_invalid_inputs_fail_before_any_cloud_call(self):
        for extra in [{'IMAGE_TAG': 'not-a-sha'}, {'ROLLBACK': 'yes'}, {'PROJECT_ID': 'bad\nproject'},
                      {'REGION': 'bad/region'}, {'SERVICE_NAME': '--help'}, {'MIGRATE_JOB_NAME': 'bad job'}]:
            with self.subTest(extra=extra):
                result, calls, _ = self.run_release(**extra)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(calls, [])

    def test_rollback_reuses_image_without_migration_or_seed(self):
        result, calls, _ = self.run_release(ROLLBACK='true')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse(any(c.startswith('run jobs ') for c in calls))


if __name__ == '__main__':
    unittest.main()
