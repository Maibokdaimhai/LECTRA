# Episode 3 evidence index

Executed locally on **14 November 2026**, macOS 26.6.2/arm64, Python 3.14.0, Node 24.22.1/npm 10.9.2, Docker 29.8.2 and Compose 5.5.0. Actual runtime metadata, source SHA-256 values and built image IDs/architecture are retained in the JSON records. No GCP/CI execution or teammate review is claimed.

## Docker and packaged browser verification

Invocation from the implementation working tree, with installed project dependencies/Chromium:

```sh
python3 scripts/verify-lab5-episode3.py --create-local-containers --evidence-dir docs/labs/lab-05/evidence/episode-3/docker-run
```

`docker-run/results.json` records **18 successful CLI commands and 25 successful executable checks**, including two actual Chromium phases. The 78 recorded file hashes match the tested Docker/application/helper inputs. This is not a count of 25 Vitest tests; domain/HTTP/browser assertions are part of the standalone Docker verification.

| Evidence | What it proves |
| --- | --- |
| `docker-run/compose-build.txt`, `unified-build.txt` | API/nginx and unified images build from repository Dockerfiles using the lockfile |
| `docker-run/results.json`, `image-tools.txt` | Actual image IDs/users, non-root API/web, runtime migration/seed/SPA files present, selected private/test paths absent, generated runtime secrets absent from image metadata/history |
| `docker-run/compose-state.txt` | db/server/client running; migrate exited 0 |
| `docker-run/explicit-seed.txt`, results checks | Zero users before explicit bootstrap, seven synthetic accounts after; migration startup does not automatically seed |
| Results checks and `browser-before.txt` | nginx health/readiness and JS asset, real API login/author/publish/submit/close/results; required-answer and duplicate rejection; real packaged browser login/results |
| `unified-up.txt`, `unified-stop.txt`, results checks | Root production image listens on supplied PORT, serves SPA + API, secure-cookie login under simulated TLS termination, same stored results, API JSON 404 and SIGTERM exit 0 |
| `compose-down-retain-volume.txt`, `compose-up-existing-volume.txt`, results checks | Actual container/network replacement without volume deletion; same domain-data snapshot, owner identity/deadline, own submission/results and account count afterward |
| `browser-after.txt` | Browser storage captured privately before down/up resumes the same authenticated session afterward, displays saved results and logs out successfully |
| `cleanup.txt` | Task-owned Compose containers stopped after verification; data volume/private local config retained, unrelated containers untouched |

Screenshots are actual Chromium captures of the Docker-served application, using synthetic content only. Credentials/cookies are not in the committed images:

- [Before restart, wide](docker-run/before-results-wide.png): logged-in instructor sees closed survey, rating distribution and persisted suggestion.
- [Before restart, narrow](docker-run/before-results-narrow.png): the same stored results at 360px.
- [After restart, wide](docker-run/after-results-wide.png): saved browser session resumes and shows the same results after down/up.
- [After restart, narrow](docker-run/after-results-narrow.png): persisted results at 360px after container replacement.
- [Logout after restart](docker-run/after-logout.png): login screen restored and private feedback hidden.

## Fresh-clone reproduction

`clean-clone/` records another successful Docker run at exact commit **`2e22c9337105db21d9d0d42bf74dafd17e852bf3`**. A new clone was created with `git clone --no-local` from the local Git repository at that committed branch; working-tree files were not copied. The initial clone had **no node_modules, .env or .local**. The setup helper and Compose image build completed **before installing any host npm dependencies**. Then `npm ci` and Chromium installation prepared only the host verification tools, and the full Docker/API/browser/down-up verification passed again: **18 CLI commands / 25 executable checks**. Its 78 build/source hashes match the implementation being submitted.

See `clean-clone/bootstrap/record.json` and the six bootstrap logs for the exact checkout SHA, absence checks and actual command outcomes. `clean-clone/results.json` contains actual image IDs, source hashes and final command/check results; screenshots there are separate actual captures from that fresh clone. Docker's shared local layer/download cache was available; this is a fresh source/private-config/database run, not a claim of a no-cache image build or an independent teammate review.

The subsequent evidence/documentation commit also preserves PDF attributes and adds LF checkout policy for shell scripts; it does not change the tested Dockerfiles/application/helper bytes. Check those bytes against the recorded source hashes when reviewing the final PR head.

## Regression and TDD

`regression/results.json` and its 16 logs record **241 passed / 0 failed / 0 skipped**, plus typecheck, API/web build, ORM and actual process-restart checks. The original selected 239 cases plus two new static-serving API cases were executed. This does not alter Episode 2's historical 239-test or Sprint 1's historical 219-test results.

`red-static-web.txt` preserves the actual pre-implementation result: EP3-W01 failed with expected 200/actual 404, while EP3-W02 passed. Green evidence is in `regression/04-api.txt`. EP3-W01 covers built HTML/JS and SPA fallback; EP3-W02 checks API JSON 404, missing assets/dotfiles, unsupported methods and JSON-only requests.

## Failed attempt retained

`attempt-1/` is the initial Docker attempt. Builds/artifact checks passed, but nginx could not write `/run/nginx.pid` as its non-root user. No domain/browser/persistence checks were completed in that attempt. `failure-note.txt` records the actual error and correction. The current Dockerfile rewrites both upstream PID paths to `/tmp/nginx.pid`; the successful `docker-run/` is a new project/volume run. Partial earlier results are not represented as passing completion evidence.

## Limits and review gate

The tested images are local Linux/arm64. No Linux/WSL host-run, amd64 execution, real TLS endpoint, Cloud Run deployment, cloud restart/redeploy or automated CI is claimed. Native Windows Python is unsupported; use the documented macOS/Linux/WSL tooling. Build/runtime commands and settings are in [Episode 3 instructions](../../episode-3-docker.md).

Teammate review and staging merge remain pending. Keep #53 open / Kanban PR Review until accepted and merged. Original earlier-episode evidence is preserved.
