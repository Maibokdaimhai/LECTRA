# Lab 5 Episode 2 — LECTRA cloud readiness

Issue: [#51](https://github.com/Maibokdaimhai/LECTRA/issues/51). Branch: `refactor/51-cloud-ready`. PR target: `staging`.

## Authority, scope and baseline

The instructor's **Student Guide GCP Deployment and CI/CD V1.1, Episode 2, §§2.1–2.5 (PDF pp. 26–29)** supplies the six checks, environment inventory, tests/build and teammate-reviewed merge into staging. The Lab 5 handout is authoritative if they differ. TokTickIT code/paths, guide issue #2 and `refactor/2-cloud-ready` are examples, adapted to LECTRA and its actual issue number. The proxy policy, test runner and explicit production operator commands below are team implementation choices supporting those checks.

The branch was created from `origin/staging` at `4070a872e4ee925bf777b607c2787cfdb6af6f97`, then fast-forwarded to accepted `origin/main` at `ec0ef24a15f155c2b2dc74871fde4a763d299a79`. This transparently brings the accepted final Sprint 1 report into staging through this PR; no history/tag was rewritten. Those report files are baseline synchronization, not new Episode 2 evidence. Sprint 1 release tags/results remain historical and unchanged.

This episode prepares local production behavior. It does not create cloud resources, alter IAM/billing, run a real production migration, deploy to Cloud Run, or package the app image. Docker packaging is Episode 3; actual GCP connectivity, ingress topology and deployment are verified in the later deployment episodes.

## Six-point disposition and evidence

| Guide check | LECTRA disposition | Source and evidence |
| --- | --- | --- |
| 1. Uploaded files survive container replacement | Not applicable to the current product: no file-upload feature, multipart upload route, attachment store or filesystem write path in application code. Feedback, users and sessions use PostgreSQL. This does not assert that a future upload feature is automatically safe. | Inspect `apps/api/src/feedback.ts`, `auth.ts`, `prisma/schema.prisma` and `apps/web/src/main.tsx`. Search `apps/api/src` and `apps/web/src` for upload/multer/filesystem writes; see `evidence/episode-2/static-review.txt`. |
| 2. Production-safe seed | Changed: explicit `db:migrate:production` and `db:seed:production`, gated by production mode, matching target confirmation, and a second seed confirmation. Passwords are supplied privately, not committed/displayed. Reruns verify existing fixtures; conflicts fail without overwriting them. | `scripts/production-database*.ts`, `seed-database.ts`; unit EP2-S01–S03, real-PG EP2-S04–S05. |
| 3. No development identity shortcut | Already enforced: actual password login, PostgreSQL session and server-side role lookup. No role/user selector or login-page password defaults. No admin user-creation/default-password feature exists, so the conditional first-login password-change requirement is not applicable. Operator-provisioned synthetic UAT accounts use private environment-supplied credentials. | `auth.ts`, web login form; EP2-A02 rejects forged identity/role headers and foreign-origin/missing-CSRF logout; existing auth/domain/browser suites cover role and ownership rejection. |
| 4. Durable sessions | Already PostgreSQL-backed; retained. Production secure cookies now work under an explicit one-hop ingress policy. | `auth.ts` `AbsoluteStore`, migration `auth_session`; EP2-A02 logs in, verifies persisted identity, recreates the app/pool with the same secret and reads `/me`, then logs out and confirms denial. Existing built-process restart check verifies sessions, survey, saved answers and results across two actual processes. |
| 5. PORT and listening address | Changed: `server.ts` retains validated `PORT` and listens on `0.0.0.0`. Start accepts environment-only configuration with no mandatory `.env` file. | EP2-C01 validates supplied port; EP2-R04 starts the built production process on a selected free port and accesses readiness through a real non-loopback local interface, then checks graceful shutdown. |
| 6. Database readiness | Added `/api/ready`, before authentication/session middleware. Executes `SELECT 1`, returns 200 when connected or a generic 503 when unavailable, `Cache-Control: no-store`, and no session cookie. | EP2-R01 (no configured DB), R02 (real PostgreSQL, stale cookie and no session creation), R03 (refused TCP database connection with liveness still 200). R03 is a connection-refusal test, not a claimed GCP outage. |

## Environment inventory

All directly read application/setup/test settings are listed in root `.env.example`; `.env.test.example` explains isolated test opt-ins. Commented examples do not activate operator/test capabilities. No `VITE_*` secret is introduced. `API_PROXY_TARGET` is read by the Vite Node process; it is not a browser credential.

| Setting | Reader / purpose | Required or default / sensitivity |
| --- | --- | --- |
| `NODE_ENV` | Runtime config, development migration and production operator guards | Default development; explicitly production in deployment; non-secret |
| `PORT` | API listener; local launcher | Default 3001; platform supplied in Cloud Run; non-secret |
| `APP_ORIGIN` | Exact allowed web origin, CSRF/origin checks and secure-cookie mode | Required; HTTPS in production; no path/trailing slash |
| `DATABASE_URL` | Runtime PG pool, Prisma datasource, operator target; test development-reference URL | Required at runtime; secret; local example is a placeholder |
| `SESSION_SECRET` | Session signing | Required; ≥32 random bytes, base64url; secret; keep stable across app instances/redeploys |
| `TRUST_PROXY` | Express request trust | `none` by default; only `1` is an allowed opt-in; non-secret |
| `API_PROXY_TARGET` | Vite dev/preview API forwarding | Default local API URL; never a secret |
| `ALLOW_DATABASE_MIGRATIONS` | Existing development migration target confirmation | Explicit database name; operator only |
| `ALLOW_PRODUCTION_DATABASE` | Production migrate/seed target confirmation | Exact target database name; operator only |
| `SEED_PRODUCTION_DEMO` | Second confirmation for explicit synthetic production seed | Exact target database name; operator only |
| `SEED_OWNER_PASSWORD`, `SEED_RESPONDENT_PASSWORD` | Private UAT/demo seed credentials | Required only by seed/browser setup; 12–128 code points, distinct roles for production; secret |
| `TEST_DATABASE_URL` | Disposable test target | Private local connection string; never deployed |
| `ALLOW_TEST_DATABASE` | Test target allowlist | Must match `lectra_test` or `lectra_test_*`, distinct from development URL |
| `DEVELOPMENT_DATABASE_URL` | Browser setup's separate development reference | Private local connection string; never deployed |
| `SEED_SYNTHETIC_DATA` | Existing disposable-test seed opt-in | Exact opted-in test database name |
| `ALLOW_FOUNDATION_TESTS` | Fresh migration/foundation suite | Exact fresh test database name |
| `ALLOW_FEATURE_TESTS` | API workflow and restart suites | Exact fresh test database name |
| `ALLOW_RELEASE_TESTS` | G-04 release regression suite | Exact fresh test database name |
| `ALLOW_POST_RELEASE_TESTS` | Unsupported-mode regression suite | Exact fresh test database name |
| `ALLOW_BROWSER_TESTS` | Real-database browser setup | Exact fresh test database name |
| `ALLOW_CLOUD_TESTS` | Episode 2 local production-profile suite | Exact fresh test database name; additional guard before production helper is exercised locally |
| `RESTART_PASSWORD` | Existing built-process restart verifier | Private feature-suite seed credential; never deployed |
| `PGOPTIONS` | Set internally for migration subprocess UTC | `-c timezone=UTC`; no user secret |
| `PLAYWRIGHT_BROWSERS_PATH` | Set internally by browser launcher | `.local/playwright-browsers`; no user secret |

Runtime/compiler/package tools also use standard process environment (e.g. PATH); these are not application configuration or secrets to deploy. The runner inherits tool paths but strips application/PG/test settings before generating isolated test credentials.

## Production startup and trust boundary

1. Inject `NODE_ENV=production`, `PORT`, `APP_ORIGIN`, `DATABASE_URL`, `SESSION_SECRET` and the reviewed `TRUST_PROXY` choice through the deployment environment/secret mechanism.
2. Build with `npm run build`; start with `npm start`. Startup performs no migration or seed. `.env` is optional for the start command; never include a private `.env` in a future image.
3. Default `TRUST_PROXY=none` ignores forged forwarded protocol headers. Secure cookies will not be issued over a plain HTTP connection under this default.
4. `TRUST_PROXY=1` is the explicit Cloud Run ingress proposal: exactly one controlled ingress hop terminates HTTPS and overwrites forwarded headers. It permits Express to recognize the external HTTPS scheme and issue `__Host-lectra.sid` cookies (`Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`, no Domain). Do not expose a bypass HTTP path to that configuration. A numeric hop policy is not an IP allowlist. Verify the actual topology/header behavior during Episode 5; change/retest the policy if there is another ingress/load-balancer path. Never set blanket trust.
5. Origin checks, session rotation, absolute expiry, role/ownership lookup and CSRF checks remain active. Forwarded headers never authenticate a user. The runtime tests cover HTTPS termination behavior locally; this is not a claim of completed Cloud Run verification.

`GET /api/health` is process liveness. `GET /api/ready` uses the existing auth PG pool and checks database reachability, not schema readiness or correctness of future migrations. Its client query timeout is 2 seconds; connecting is bounded by the pool's existing 3-second connection timeout. Errors never return SQL, hostnames, credentials or stack traces. The existing LECTRA envelope is retained: `{"data":{"status":"ready","db":"connected"}}` / `{"data":{"status":"not_ready"}}`. Adapt later smoke tooling to this envelope instead of copying TokTickIT's response shape.

## Explicit database operations

The production commands are intended for the lab's synthetic demo database, not real student data. Review the exact target before a future cloud operation. Current tests invoke them only against NEW locally allowlisted test storage.

```sh
# Environment is injected privately; no real value is written in this document.
npm run db:migrate:production
# Optional, explicit first-time UAT/demo bootstrap, never part of server startup:
npm run db:seed:production
```

Both require `NODE_ENV=production` and `ALLOW_PRODUCTION_DATABASE` matching the database name in `DATABASE_URL`. Seed additionally requires matching `SEED_PRODUCTION_DEMO` and both private role passwords. Identical role passwords and known placeholder prefixes are rejected. The target's actual database name is checked before migration/seed. Hidden URL host/port routing overrides are rejected to avoid inconsistent pg/Prisma targets. Migration is `prisma migrate deploy` only; there is no reset path or automatic retry. Both connection and CLI failures produce generic messages; never print private environments or Prisma subprocess errors publicly.

The shared fixture transaction uses an advisory lock and insert-or-verify semantics. Repeating a seed with unchanged fixtures/passwords succeeds without rotating hashes or deleting unrelated data, sessions or responses. If someone has changed a seeded fixture (including publishing its Draft survey), a rerun deliberately refuses and rolls back rather than reverting that work. Do not reset the database to force a seed to pass; leave the existing demo data intact and investigate privately. There is no automatic reseed after restart/deploy.

The existing `seedSyntheticDatabase` and disposable-test guards remain unchanged at their authorization boundary; production support does not let test tools target a deployed database. TCP PostgreSQL URL behavior is covered here. Cloud SQL connection method, transport/SSL settings and secret injection are selected and verified in the deployment episode; Unix-socket URL routing is not enabled by this change.

## Verification, evidence and review

**Supported reproduction platforms: macOS and Linux (including Linux inside WSL 2). Native Windows Python/PowerShell is unsupported.** Use the environment's own Node/npm/Python and Linux Docker containers; Windows `.cmd` executables and Windows-installed dependencies must not be reused inside WSL. The runner now rejects unsupported platforms before creating a container. This scope is a team tooling decision, not an additional instructor requirement.

The demonstrated successful supported environment is **macOS 26.6.2 / arm64**, Python 3.14.0, Node 24.22.1/npm 10.9.2. The correction's actual results and environment metadata are recorded separately in `evidence/episode-2/reproduction-macos/`. Linux/WSL commands are provided for reproduction, but a successful run on those platforms is not claimed. See [exact WSL/Ubuntu installation, checkout and verification commands](deployment.md#exact-wsl-2--ubuntu-reproduction-steps).

Run from the repository root in the supported POSIX environment using pinned Node/npm, Python 3.10+, Docker and installed Chromium:

```sh
npm ci
npm run browsers:install
python3 scripts/verify-lab5-episode2.py --create-local-test-databases
```

The Python standard-library runner requires Docker, creates one dedicated PostgreSQL 17 container and eight new databases, uses private generated credentials, executes typecheck/build and the full selected regression/browser matrix, and stops only its own container in `finally`. No existing database is reused/reset. Docker test infrastructure is a verification prerequisite, not a claim that the Episode 3 application image is implemented. Container/database storage is retained stopped for investigation; it is not removed automatically. Credentials remain in memory and are redacted from retained logs. Repeated verification uses a new timestamped container. Output defaults to a new ignored `.local/lab5-episode2/<timestamp>/` directory; `--evidence-dir <new-directory>` allows an explicit evidence destination. A destination with `results.json` is refused to preserve historical evidence. OS/tool preflight is recorded in new results. Do not run concurrently on the same fixed browser ports.

Evidence under `evidence/episode-2/`:

- `red-runtime.txt`: six genuine pre-implementation assertion failures (proxy config and readiness). `restricted-run.txt` preserves the earlier restricted-port run; its EPERM is an environment failure, not application RED evidence.
- `initial-runner-failure.txt`: transparent local-infrastructure setup failure; corrected by waiting for TCP PostgreSQL readiness instead of the temporary initialization socket. No application tests ran in that attempt.
- `results.json`: original implementation record for `9ee6378`, including its assessed base commit, 79 source hashes and command exits. These original hashes identify that earlier candidate and are not silently rewritten after the runner correction.
- `reproduction-macos/results.json`: correction reproduction with actual host/tool metadata, current assessed source hashes and the 16 command results; see its README for the exact invocation. This supplements rather than replaces the original results.
- `01-*.txt` through `16-*.txt`: command outputs for typecheck/build, unit/API/cloud/feature/release/foundation/database/post-release suites, ORM, built restart and browser suites.
- `static-review.txt`: bounded source inspection for uploads, identity shortcuts, environment reads and absence of startup seed.

Use the current `results.json` and logs for counts; do not add Episode 2 results to the historical Sprint 1 219-test record. The PR must link the evidence and copy the six-point disposition. PR submission is not completion: teammate review/approval and merge into staging are still required, after which #51 and Kanban can become Done.
