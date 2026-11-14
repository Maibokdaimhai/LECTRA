#!/usr/bin/env bash
# Episode 4 imports the complete starter-script set for syntax/offline checks.
# Real resource changes remain disabled until Episode 5 LECTRA adaptation/review.
require_offline_execution() {
  if [[ "${1:-}" == PREVIEW && "${DRY_RUN:-0}" == 1 ]]; then
    return
  fi
  local stub_dir="${LECTRA_OFFLINE_STUB_DIR:-}"
  if [[ -n "$stub_dir" && -d "$stub_dir" && "$(command -v gcloud || true)" == "$stub_dir/gcloud" ]] &&
     grep -q '^# LECTRA_OFFLINE_TEST_STUB$' "$stub_dir/gcloud"; then
    return
  fi
  echo 'Episode 4 template only: live cloud execution is disabled. Use DRY_RUN=1 for supported previews or the offline test harness. Complete/review LECTRA deployment adaptation in Episode 5.' >&2
  exit 2
}
