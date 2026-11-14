#!/usr/bin/env bash
set -euo pipefail
bash -n deploy/deploy.sh deploy/release.sh deploy/teardown.sh deploy/offline_guard.sh
bash deploy/tests/test_deploy_stub.sh
bash deploy/tests/test_release_stub.sh
python3 -m unittest discover -s deploy/tests -p 'test_*.py' -v
