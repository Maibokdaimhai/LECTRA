# Episode 5 — operator-provided evidence

Evidence supplied by the user on 2026-11-19. Cloud operations were performed by the user, not the agent. Exact execution times are available only where recorded in the transcript.

| ID | File | Caption / supported claim |
| --- | --- | --- |
| E5-OP-01 | E5-OP-01-dry-run.png | Cloud Shell deployment preview for cpe334-2026-lectra / asia-southeast1. DRY_RUN markers and placeholder SHA/project number identify preview output; this screenshot does not prove a live deployment. |
| E5-OP-02 | E5-OP-02-cloud-shell-transcript.txt | User-provided transcript contains main update, dry-run, real provisioning, successful Cloud Build, migration/bootstrap executions and Cloud Run deployment. |

## Recorded deployment

- Source main commit: `fb087dd00401c073d8401498281e6ea475dfdaac`
- Cloud Build: `5e72604c-98e6-487a-b7bc-12e3aaea8ef0`, SUCCESS; created 2026-11-19T16:04:09+00:00.
- Image digest: `sha256:f30685b3cc0bbe0605fa7c1080201d5eef4be05247e0043d345ef4c49422ebda`
- Migration execution: `lectra-migrate-5th5j`, successfully completed.
- Bootstrap execution: `lectra-bootstrap-8m254`, successfully completed.
- Cloud Run revision: `lectra-00001-rbz`, reported serving 100 percent of traffic.
- Canonical URL: https://lectra-251142553134.asia-southeast1.run.app

## Remaining verification

The deployment transcript proves deployment commands succeeded. Subsequent evidence below records health/readiness success, an initial smoke failure, Cloud SQL configuration and the public login page. Authenticated login/logout, domain persistence verification, a successful corrected smoke run and remaining Console screenshots are still pending. No agent access to the GCP control plane was performed; the agent opened only the public login page at the user’s request.

## Integrity

The attached image and transcript are preserved byte-for-byte. The transcript includes user/account identifiers and resource metadata; no actual secret values were observed in the provided text. Review before publication.

- `E5-OP-01-dry-run.png` SHA-256: `2fb77fbdc702db7b1161c7afcf8faac72889f8a068a8c192d8ee820c6b7fd4eb`
- `E5-OP-02-cloud-shell-transcript.txt` SHA-256: `5fc83b4cf4d754da93a1963155a71698761ad5054f63c16ac0ee2c2d2cb08c53`

## E5-OP-03 — initial post-deployment smoke

User-provided screenshot: `E5-OP-03-health-ready-smoke-failure.png`. Health returned status ok; readiness returned ready/db connected. Smoke printed PASS for both API routes, then failed at `/`. Overall smoke is FAIL, not acceptance. Root-route response/status and content negotiation need investigation. No screenshot execution timestamp is available.

## E5-OP-04 — Cloud SQL storage auto-increase disabled (§5.4)

User-provided screenshot: `E5-OP-04-cloudsql-storage-auto-increase-off.png`. The displayed `gcloud sql instances describe` result identifies `lectra-pg`, `POSTGRES_17`, region `asia-southeast1`, disk size 10 GB, and `storageAutoResize: false`. This is actual operator-provided configuration evidence supporting §5.4. Exact command execution time is not visible. The preceding smoke failure remains separately recorded in E5-OP-03; this configuration check does not resolve it.

- Image SHA-256: `0080b92f1f567ba018fbd2de329e9973af0559c2a898511a925bd90c3930ad50`

## E5-OP-05 — public login page (§5.5)

`E5-OP-05-public-login.png` shows the live LECTRA login page in the ChatGPT in-app browser, including Service connection ready and empty email/password fields. Capture time, canonical URL and accessibility observation are recorded in `E5-OP-05-public-login-observation.txt`. No Google sign-in was required. This does not prove authenticated login/logout or domain workflows.

## Smoke correction and operator handoff

The operator supplied actual curl responses for `/`: `Accept: text/html` returned HTTP/2 200 with the LECTRA HTML page, while `Accept: application/json` returned HTTP/2 404. Both response Date headers were Thu, 19 Nov 2026 16:19:04 GMT. This establishes that the smoke transport requested the wrong representation for the SPA route. The correction changes only the smoke client Accept header for `/`; API requests retain application/json. No application runtime code is changed.

After reviewed merge, update clean main in Cloud Shell and run `python3 deploy/smoke_test.py "$SERVICE_URL"`. The user additionally requested redeployment from the new main; use the reviewed `deploy/deploy.sh --demo` live opt-in command in the runbook, record the new main SHA/revision/digest, and rerun smoke after deployment. Do not describe the old revision as built from the new commit. The historical failed smoke evidence remains intact. No corrected live smoke or redeployment has yet been performed.

Local regression: `smoke-regression-red.txt` records 8 tests / 1 failure against the main baseline and new regression; `smoke-regression-green.txt` records all 14 deploy Python tests passing after correction. Command: `python3 -m unittest discover -s deploy/tests -p "test_*.py"`. Network transport is mocked; this is not live smoke evidence.
