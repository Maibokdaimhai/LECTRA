# PR #54 — Two Minor findings corrected

Actual execution on 14 November 2026, macOS/arm64 with the same pinned Node/npm and local Docker Linux containers. This is author-executed evidence, not an independent reviewer rerun. Historical Episode 3 241-test and fresh-clone records are preserved; they identify the earlier implementation, not this correction.

## Minor 1: encoded static paths

`apps/api/src/web.ts` decodes the pathname once before exclusions, matching static-file decoding without rewriting req.url or decoding a second time. Dotfile detection and SPA extension/assets exclusions use that decoded value. Malformed URI encoding/invalid UTF-8 or a decoded null byte is rejected with 400 and no-store; query-string encoding is not included in pathname validation.

Actual API regressions: encoded dotfiles, extensions and assets return 404 for GET/HEAD; malformed encodings return 400; legitimate encoded assets/client routes still work. `red-static.txt` records the pre-fix 7 failed / 3 passed outcome. `green-static.txt` records 10 passed afterward. These 10 cases are included in the full matrix, not counted twice. The packaged unified production image also verifies the three reported encoded paths and a malformed path, all with Accept: text/html so a mistaken SPA fallback cannot be hidden by JSON-only requests.

## Minor 2: Compose environment precedence

`scripts/docker_verifier_environment.py` removes the generated env-file's complete managed-key set from the inherited subprocess environment. It derives the set directly from `values.keys()`, including POSTGRES_PASSWORD, WEB_PORT and API_PORT; future managed keys inherit the same isolation. Existing removal of unrelated PG/test/Compose controls remains, while PATH/Docker access settings are retained. The input environment is not mutated.

`red-environment.txt` is a controlled evaluation of the original environment expression with synthetic values: all three reported keys were retained, causing the expected assertion failure. No real credentials or subprocesses were used in that reproduction. Four permanent Python tests pass; see `python-environment-tests.txt` and `python-tests.json` for the actual command, result and source hashes.

The complete Docker run was launched with **all nine** generated Compose settings deliberately set to conflicting shell values:

```sh
WEB_PORT=1 API_PORT=1 POSTGRES_PASSWORD=synthetic-inherited-conflict \
SESSION_SECRET=synthetic-inherited-conflict SEED_OWNER_PASSWORD=synthetic-inherited-conflict \
SEED_RESPONDENT_PASSWORD=synthetic-inherited-conflict APP_ORIGIN=https://wrong.example.test \
API_IMAGE=invalid-conflicting-image WEB_IMAGE=invalid-conflicting-image \
python3 scripts/verify-lab5-episode3.py --create-local-containers --evidence-dir .local/review-reproduction
```

The actual retained run used `--evidence-dir docs/labs/lab-05/evidence/episode-3/review-correction/docker-run`. All generated ports/credentials/image tags remained authoritative and the real login/domain/browser/persistence workflow passed. This directly exercises Compose precedence rather than relying only on a dictionary assertion.

## Actual results and limits

- `regression/results.json`: **249 selected Vitest/Playwright tests passed, 0 failed, 0 skipped**, plus typecheck/build/ORM/built-process restart; all **16 commands exited 0**. The original 241 plus 8 encoded-path/validation cases were executed. Its **89 assessed source hashes** match the corrected candidate.
- `python-tests.json`: **4 separate Python environment tests passed**. These are not included in the 249 count.
- `docker-run/results.json`: **18 CLI commands and 30 executable checks passed**, including shell-environment isolation, four packaged encoded-path checks, actual browser phases, down/up persistence and secure-cookie production-profile login. Its **79 assessed input hashes** match the corrected candidate.
- `docker-run/*-results-*.png` and `after-logout.png`: actual packaged UI before/after restart and logout, with synthetic content only. These are new captures, not relabeled original images.

Both runs used new local database/container storage; containers were stopped, volumes retained. Earlier raw results/RED/failed-attempt evidence were not rewritten. The correction was run from the implementation working tree, not another fresh clone. No amd64/Cloud Run execution, real TLS endpoint or CI result is claimed; a compatible linux/amd64 or multi-platform image must be built/verified in the later deployment episode. No architecture redesign, cloud operation or npm dependency change was made. Teammate re-review and staging merge remain pending.
