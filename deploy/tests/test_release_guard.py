"""The live release guard is checked without executing any cloud command."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

GUARD = Path(__file__).resolve().parents[1] / 'offline_guard.sh'
SHA = 'a' * 40


class ReleaseGuardTests(unittest.TestCase):
    def check_guard(self, **changes):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp).resolve()
            temp = str(root)
            git = root / 'git'
            git.write_text('''#!/bin/sh
case "$*" in
 'rev-parse --show-toplevel') printf '%s\\n' "$TEST_ROOT" ;;
 'rev-parse HEAD') printf '%s\\n' "$TEST_HEAD" ;;
 'status --porcelain') printf '%s' "$TEST_DIRTY" ;;
 *) exit 99 ;;
esac
''')
            git.chmod(0o700)
            cloud = root / 'gcloud'
            cloud.write_text('#!/bin/sh\necho unsafe > "$CALL_LOG"\nexit 99\n')
            cloud.chmod(0o700)
            env = {**os.environ, 'PATH': temp + ':' + os.environ['PATH'], 'GITHUB_ACTIONS': 'true',
                   'GITHUB_REPOSITORY': 'Maibokdaimhai/LECTRA', 'GITHUB_REF': 'refs/heads/main',
                   'GITHUB_WORKFLOW_REF': 'Maibokdaimhai/LECTRA/.github/workflows/deploy.yml@refs/heads/main',
                   'GITHUB_EVENT_NAME': 'push', 'PROJECT_ID': 'release-test',
                   'ALLOW_LIVE_GCP_PROJECT': 'release-test', 'DRY_RUN': '0',
                   'GITHUB_WORKSPACE': temp, 'GITHUB_SHA': SHA, 'TEST_HEAD': SHA,
                   'TEST_ROOT': temp, 'TEST_DIRTY': '', 'LECTRA_OFFLINE_STUB_DIR': '',
                   'CALL_LOG': str(root / 'called'), **changes}
            p = subprocess.run(['bash', '-c', 'source "$1"; require_release_execution; echo accepted',
                                'guard-test', str(GUARD)], cwd=root, env=env, capture_output=True, text=True)
            self.assertFalse((root / 'called').exists())
            return p

    def test_reviewed_main_push_context_passes_guard_only(self):
        p = self.check_guard()
        self.assertEqual(p.returncode, 0, p.stderr)
        self.assertIn('accepted', p.stdout)

    def test_main_manual_dispatch_context_passes_guard_only(self):
        self.assertEqual(self.check_guard(GITHUB_EVENT_NAME='workflow_dispatch').returncode, 0)

    def test_untrusted_context_is_refused_before_cloud(self):
        for changes in [{'GITHUB_ACTIONS': 'false'}, {'GITHUB_REPOSITORY': 'other/LECTRA'},
                        {'GITHUB_REF': 'refs/heads/staging'}, {'GITHUB_EVENT_NAME': 'pull_request'},
                        {'GITHUB_WORKFLOW_REF': 'Maibokdaimhai/LECTRA/.github/workflows/other.yml@refs/heads/main'},
                        {'ALLOW_LIVE_GCP_PROJECT': ''}, {'ALLOW_LIVE_GCP_PROJECT': 'other-project'}]:
            with self.subTest(changes=changes):
                self.assertEqual(self.check_guard(**changes).returncode, 2)

    def test_wrong_or_dirty_checkout_and_fake_dry_run_are_refused(self):
        for changes in [{'TEST_HEAD': 'b' * 40}, {'TEST_DIRTY': ' M deploy/release.sh'},
                        {'GITHUB_WORKSPACE': '/other'}, {'TEST_ROOT': '/other'}, {'DRY_RUN': '1'}]:
            with self.subTest(changes=changes):
                self.assertEqual(self.check_guard(**changes).returncode, 2)


if __name__ == '__main__':
    unittest.main()
