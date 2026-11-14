"""Fail closed before gcloud; live entry requires explicit project and clean current main."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

GUARD = Path(__file__).resolve().parents[1] / 'offline_guard.sh'


class FirstDeploymentGuardTests(unittest.TestCase):
    def check_guard(self, branch='main', dirty='', remote='a' * 40, confirmation='lectra-testproj'):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            git = root / 'git'
            git.write_text('''#!/bin/sh
case "$*" in
  'rev-parse --show-toplevel') printf '%s\\n' "$PWD" ;;
  'symbolic-ref --short HEAD') printf '%s\\n' "$TEST_BRANCH" ;;
  'status --porcelain') printf '%s' "$TEST_DIRTY" ;;
  'rev-parse HEAD') printf '%s\\n' aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa ;;
  'ls-remote origin refs/heads/main') printf '%s\\trefs/heads/main\\n' "$TEST_REMOTE" ;;
  *) exit 99 ;;
esac
''')
            git.chmod(0o700)
            cloud = root / 'gcloud'
            cloud.write_text('#!/bin/sh\necho unsafe > "$CALL_LOG"\nexit 99\n')
            cloud.chmod(0o700)
            env = {**os.environ, 'PATH': temp + ':' + os.environ['PATH'], 'TEST_BRANCH': branch,
                   'TEST_DIRTY': dirty, 'TEST_REMOTE': remote, 'PROJECT_ID': 'lectra-testproj',
                   'ALLOW_LIVE_GCP_PROJECT': confirmation, 'DRY_RUN': '0', 'LECTRA_OFFLINE_STUB_DIR': '',
                   'CALL_LOG': str(root / 'called')}
            result = subprocess.run(['bash', '-c', 'source "$1"; require_first_deployment_execution; echo accepted',
                                     'guard-test', str(GUARD)], cwd=root, env=env, capture_output=True, text=True)
            self.assertFalse((root / 'called').exists())
            return result

    def test_explicit_exact_project_confirmation(self):
        for confirmation in ['', 'other-project']:
            with self.subTest(confirmation=confirmation):
                self.assertEqual(self.check_guard(confirmation=confirmation).returncode, 2)

    def test_branch_and_clean_main_and_current_remote_are_required(self):
        for args in [{'branch': 'feature/example'}, {'dirty': ' M deploy/deploy.sh'}, {'remote': 'b' * 40}]:
            with self.subTest(args=args):
                self.assertEqual(self.check_guard(**args).returncode, 2)

    def test_exact_clean_main_only_passes_the_guard_not_a_deployment(self):
        result = self.check_guard()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('accepted', result.stdout)


if __name__ == '__main__':
    unittest.main()
