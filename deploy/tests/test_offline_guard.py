"""Verify Episode 4 templates cannot accidentally call a live gcloud."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class OfflineGuardTests(unittest.TestCase):
    def run_script(self, script, preview=False):
        with tempfile.TemporaryDirectory() as temp:
            fake = Path(temp) / 'gcloud'
            log = Path(temp) / 'called'
            fake.write_text('#!/bin/sh\nprintf called > "$CALL_LOG"\n')
            fake.chmod(0o700)
            env = {'PATH': temp + ':' + os.environ['PATH'], 'CALL_LOG': str(log), 'PROJECT_ID': 'offline-project',
                   'REGION': 'asia-southeast1', 'DRY_RUN': '1' if preview else '0',
                   'IMAGE_TAG': '1' * 40, 'LECTRA_OFFLINE_STUB_DIR': temp}
            p = subprocess.run(['bash', str(ROOT / script)], cwd=ROOT.parent, env=env, capture_output=True, text=True)
            self.assertFalse(log.exists(), 'Unmarked gcloud executable must never be called')
            return p

    def test_live_scripts_are_refused_even_with_unmarked_stub_directory(self):
        for script in ['deploy.sh', 'release.sh', 'teardown.sh']:
            with self.subTest(script=script):
                p = self.run_script(script)
                self.assertEqual(p.returncode, 2)
                self.assertIn('live cloud execution is disabled', p.stderr)

    def test_supported_previews_make_zero_cloud_calls(self):
        for script in ['deploy.sh', 'teardown.sh']:
            with self.subTest(script=script):
                self.assertEqual(self.run_script(script, True).returncode, 0)

    def test_release_has_no_unimplemented_dry_run_bypass(self):
        self.assertEqual(self.run_script('release.sh', True).returncode, 2)


if __name__ == '__main__':
    unittest.main()
