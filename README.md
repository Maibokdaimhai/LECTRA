# LECTRA

Lecture Evaluation, Classroom Thoughts, Reviews & Analytics — CPE334 identified lecture feedback.

Sprint 1 provides real login, scoped Course/Section/Lecture discovery, Draft → Published → Closed surveys, one-time student feedback, saved own-answer readback and owner summaries. Reviewed correction release **sprint-1.1 / b458cb6** is on main and passed **219 selected post-main tests**, plus typecheck/build/ORM/restart. The original sprint-1 release remains immutable. See [current release evidence](docs/sprints/sprint-1/corrected-main-release.md) and [Deliverable 1 report](docs/deliverable-1/README.md).

## Requirements

- Node **24.22.1**, npm **10.9.2**; the install guard intentionally refuses other versions.
- PostgreSQL **17** (verified patch **17.11**).
- Git. Docker is an optional way to run the local database; an application image, CI/CD and cloud deployment are not required for this local setup.
- Free demo ports: database 55432, API 3001, web 5173. Browser checks use 3102/4174, isolated UI checks 4175, smoke 3101/4173 and built-process restart 3105.

Run commands from the repository root with the pinned runtime on PATH. Confirm `node --version` and `npm --version` first. The local setup commands below can be used in PowerShell; use `node --env-file=...` instead of platform-specific shell environment exports. **The Lab 5 Episode 2 Python verification runner requires macOS or Linux (including a WSL 2 Linux shell); native Windows Python/PowerShell is unsupported.** See [supported environments and WSL commands](docs/labs/lab-05/deployment.md#supported-episode-2-verification-environment).

## Fresh checkout and private configuration

For the **Lab 5 container workflow**, see [Episode 3 Docker setup and evidence](docs/labs/lab-05/episode-3-docker.md). It uses separate ignored `.local/docker.env`, a Compose project and persistent volume; it does not reuse/reset the local test/demo database below. The root Dockerfile builds the combined API/SPA image for later CI/deployment.

```sh
git clone --branch staging https://github.com/Maibokdaimhai/LECTRA.git
cd LECTRA
git rev-parse HEAD
npm ci
npm run setup:local
```

For a reviewed release, check out its actual agreed commit/tag instead of assuming current staging is assessed. Record the SHA and actual command results. `setup:local` creates ignored `.env`, `.env.test.local` and `.local/postgres.env` with random synthetic secrets and mode 0600 where supported. It refuses to overwrite existing files. Do not copy someone else's configuration, publish passwords/URLs/session secrets or delete existing files merely to bypass that refusal.

Generated targets are distinct `lectra_dev` and `lectra_test` on loopback 55432. The local demo uses only explicitly opted-in `lectra_test`; the development URL remains a separate reference. The demo does not require creating or seeding `lectra_dev`. Ordinary development migration is a separate explicit opt-in described below.

## Local database and demo

With a **new** container and **new** named volume, the generated PostgreSQL environment supplies the matching user/password/database:

```sh
docker run --name lectra-demo-postgres --env-file .local/postgres.env --publish 127.0.0.1:55432:5432 --mount type=volume,source=lectra-demo-postgres-data,target=/var/lib/postgresql/data -d postgres:17-alpine
docker exec lectra-demo-postgres pg_isready -h 127.0.0.1 -U lectra
npm run demo:config
npm run demo:migrate
npm run demo:seed
npm run demo
```

Wait for the TCP `pg_isready -h 127.0.0.1` check to report accepting connections before database creation/migrations; an early Unix-socket-only bootstrap server is not the final service. If a name/volume/port is already used, do not stop/delete/reuse another person's resource: choose distinct task-owned names and align private URL ports. A pre-existing volume may have different credentials/data; generating a new password does not update it. For an existing PostgreSQL 17 service, privately set the corresponding distinct URLs and allowlisted test name instead of running Docker. No automatic reset is provided.

`demo:config` validates test/development separation and creates ignored `.local/demo-setup.env` / `.local/demo.env` without overwriting them. `demo:migrate` applies the real forward migration history, including session storage; `demo:seed` creates/verifies synthetic fixtures and Argon2id hashes. Nothing seeds on application startup.

Open **http://127.0.0.1:5173**. Use this exact origin: `localhost` and `127.0.0.1` are different origins for cookies/CSRF. API listens on `0.0.0.0:3001` for container compatibility; Vite proxies `/api` to it. Restrict local access with your firewall and loopback-only container port mappings. Builds/typecheck generate the ignored Prisma client.

Lab 5 Episode 2 runtime changes and verification are documented in [cloud readiness](docs/labs/lab-05/episode-2-cloud-readiness.md). Cloud deployment and Docker packaging are separate later episodes; no live cloud deployment is claimed here.

| Role / context | Synthetic login |
| --- | --- |
| Instructor, Section A | `owner.1@example.test` |
| Instructor, another Section of the same Course | `owner.2@example.test` |
| Instructor, no owned Sections | `owner.3@example.test` |
| Eligible Section A students | `respondent.11@example.test`, `respondent.12@example.test` |
| Ineligible for Section A / no membership | `respondent.13@example.test`, `respondent.14@example.test` |

Read the two random seed passwords **locally** from `.local/demo-setup.env`: `SEED_OWNER_PASSWORD` for owners and `SEED_RESPONDENT_PASSWORD` for students. No default password, signup or role selector exists. Share any necessary handoff privately; exclude passwords, cookies, tokens and private configuration from Git/PR/PDF/screenshots. Do not screenshot the password field or private account file.

### Try the feedback cycle

1. Log in as Owner 1. Select **SYN-CPE334 → Section A → Lecture 2** and create a Draft. Lecture 1 already has the seeded Draft; each Lecture permits one survey.
2. Add a required Rating 1–5 with endpoint labels and interpretation, plus optional written feedback. Save, then confirm Publish. Published questions and eligibility are frozen.
3. Log out. Student 11 opens the survey, submits without the required rating and observes rejection with entered text retained; then submits valid feedback. Reload/reopen to see immutable saved answers.
4. Owner 1 sees count only while Published. Confirm Close to see exact means, all score bins and unlabelled text. Closed collection cannot reopen.
5. A second Student 11 session with an already-open form cannot create a second response. Student 13 cannot discover the Section A survey. Owner 2 cannot discover/manage it. API/database checks verify server-side denial; hidden UI alone is not authorization evidence.

Surveys are **identified**: answers remain linked to accounts in storage. Owner results omit account identifiers, but comments/small groups may identify someone. Anonymous mode, CSV/history/notes are later work.

### Stop, resume and retain data

Ctrl+C in the demo terminal stops web/API and closes their pools. Restart `npm run demo` against the same database/configuration to retain data and unexpired sessions. With the named volume above, database stop/start also retains data:

```sh
docker stop lectra-demo-postgres
docker start lectra-demo-postgres
npm run demo
```

Do not remove the database volume if you want to keep feedback. Do not rerun seed after editing/publishing the seeded Lecture 1 Draft: it deliberately refuses mismatching fixtures instead of overwriting them. Repeating seed before fixture changes verifies data and retains existing hashes/sessions/submissions. A new demo requires a new explicitly opted-in database/configuration, not a reset of existing data.

## Build and tests

```sh
npm run typecheck
npm run build
npm test
npm run browsers:install
npm run test:e2e:recovery
npm run test:e2e
```

`npm test` is units plus API liveness. `test:e2e:recovery` is isolated React/browser **mocked HTTP** at 360px/1280px on 4175. `test:e2e` is inherited browser/API-request smoke, using a deliberately unavailable dummy database. Neither replaces real API/PostgreSQL journeys. Browser binaries stay under ignored `.local/playwright-browsers`.

Real feature, foundation and browser suites each require their **own new empty** `lectra_test` / `lectra_test_*` database and matching explicit opt-in. Do not aim them at the now-populated demo DB, run them concurrently on one target, weaken guards or reset an existing schema. [Fresh verification and handoff](docs/sprints/sprint-1/setup-and-handoff.md) supplies exact private configuration fields and commands.

```sh
node --env-file=.local/api-check.env node_modules/vitest/vitest.mjs run --config vitest.features.config.ts
node --env-file=.local/api-check.env node_modules/vitest/vitest.mjs run --config vitest.db.config.ts
node --env-file=.local/api-check.env --import tsx scripts/orm-smoke.ts
node --env-file=.local/api-check.env --import tsx scripts/verify-restart.ts
node --env-file=.local/foundation-check.env node_modules/vitest/vitest.mjs run --config vitest.foundation.config.ts
npm run test:e2e:features
```

The API suite migrates/seeds its own empty target; set a private `RESTART_PASSWORD` for that run so the subsequent built-process restart check can log into the same fixtures. The foundation suite uses a second empty target and `ALLOW_FOUNDATION_TESTS`. Browser preparation reads `.local/browser.env`, checks separation/emptiness, migrates/seeds and executes actual web/API/PostgreSQL at 4174/3102 with a private per-scenario clock. It uses one worker, no server reuse and no retries. Controlled response delivery failures are explicitly distinguished from synthetic HTTP fixtures. Use new empty targets for each full rerun.

The alternative npm `test:features`, `test:db`, `test:db:foundation` and `check:orm` scripts read `.env.test.local`; choose them only when that file targets the correct opted-in test database. Environment variables already set in the parent process override `--env-file` values; clear stale test URLs/opt-ins or use a clean terminal before reproduction.

For ordinary development forward migrations, create the intended development DB and explicitly set `NODE_ENV=development`, `DATABASE_URL` and matching `ALLOW_DATABASE_MIGRATIONS` in `.env`, then run `npm run db:migrate:dev`. This never seeds/resets. `npm start` runs the **built API only** using `.env`; it does not serve the built web. Production HTTPS/proxy/cloud deployment remains separate, unverified later-lab work.

## Evidence and acceptance

See [engineering docs](docs/README.md), [contracts](docs/sprints/sprint-1/README.md), [actual verification](docs/sprints/sprint-1/implementation-evidence.md), [fresh-setup evidence](docs/sprints/sprint-1/setup-and-handoff.md) and [release readiness](docs/sprints/sprint-1/release-readiness.md). Instructor requirements and team-selected designs remain distinct.

The project owner chose author-run fresh-checkout reproduction followed by teammate PR review for #24. Record the actual executor, SHA, environment, commands, failures/skips and observations; do not rename an assistant run as teammate execution. Assessed release evidence must identify the accepted main SHA/tag and checks on that version. The published Deliverable 1 PDF assesses the corrected sprint-1.1 release at b458cb65736029f5c7de55e49c9afd6bc8de702a; final report review and course submission remain separate human actions.

## Corrected Sprint 1 regression

The canonical focused suite is `apps/api/tests/post-release/ac-gaps.test.ts`, configured in `vitest.post-release.config.ts`. Run it with `node --env-file=.env.test.local node_modules/vitest/vitest.mjs run --config vitest.post-release.config.ts` only against its own new empty opted-in target, with `ALLOW_POST_RELEASE_TESTS` matching `ALLOW_TEST_DATABASE`. It verifies the original IDENTIFIED-only enum before extending only that disposable test database to exercise unsupported-mode rejection. Do not point it at an existing development/demo/shared database. This does not enable Anonymous Mode in the product.
