# LECTRA

Lecture Evaluation, Classroom Thoughts, Reviews & Analytics - CPE334 lecture feedback.

This branch supplies a review candidate for identified lecture feedback: real login, scoped classroom/survey discovery, Draft/publish/close, one-time student answers, own readback and owner summaries. It builds on database PR #35. It is not an accepted main release. See [engineering docs](docs/README.md), [contracts](docs/sprints/sprint-1/README.md), [implementation/evidence boundaries](docs/sprints/sprint-1/implementation-evidence.md).

## Prerequisites

Node **24.22.1**, npm **10.9.2**, PostgreSQL **17** (verified patch 17.11), one root lockfile. Install the pinned runtime first; the runtime guard intentionally refuses another version. No CI/cloud deployment or application Docker image is required for this local increment.

```sh
npm ci
npm run setup:local
```

`setup:local` creates ignored `.env`, `.env.test.local`, `.local/postgres.env` with random synthetic secrets and mode 0600; it refuses existing files. Examples contain placeholders only. Keep actual URLs/passwords/session secrets out of Git/PDF. Build/typecheck generate the Prisma client; generated files stay ignored.

## Disposable database and private demo

Configure `.env.test.local` with a dedicated `lectra_test` or `lectra_test_*` target, a distinct actual development `DATABASE_URL`, and matching `ALLOW_TEST_DATABASE`. Host/port query overrides are rejected in both URLs. Optional local Docker example uses only a new disposable container (do not replace an existing one):

```sh
docker run --name lectra-demo-postgres --env-file .local/postgres.env --publish 127.0.0.1:55432:5432 --tmpfs /var/lib/postgresql/data -d postgres:17-alpine
npm run demo:config
npm run demo:migrate
npm run demo:seed
npm run demo
```

The example creates `lectra_test` from `POSTGRES_DB` in the local setup file; keep URL/name/port aligned. `demo:config` first validates test/development separation, then creates `.local/demo-setup.env` and `.local/demo.env` without overwriting existing files. All secrets are private local random values (0600). Runtime points at the explicitly opted-in synthetic database; the distinct development reference is retained in setup configuration. No development/deployed database is seeded.

Open **http://127.0.0.1:5173**. API runs on loopback 3001; Vite forwards same-origin `/api`. Synthetic accounts are `owner.1@example.test`, `owner.2@example.test`, `owner.3@example.test` and `respondent.11@example.test` through `respondent.14@example.test`. Retrieve the two privately generated passwords locally from `.local/demo-setup.env`; share through an agreed private channel, never repository/PR/report/screenshots. No default password, role selector or signup exists.

Repeat seed verifies matching fixtures and retains hashes/sessions/submissions. An edited/published seeded Draft deliberately causes refusal rather than overwriting it. Do not reset or rerun seed to erase demo evidence. Use a new disposable target for a fresh demonstration.

Normal workflow: Owner 1 selects SYN-CPE334 → Section A → Lecture 2, creates a Draft, adds a required 1–5 RATING with explicit endpoint labels/interpretation and optional TEXT, saves, then publishes. Respondent 11 opens the eligible survey, tries submitting without the required score (rejected), then submits valid feedback and reopens saved immutable answers. Owner 1 sees only count before closing, then closes and sees means/distribution/unlabelled comments. Owner 2 cannot access the survey; Respondent 13 is ineligible. Published/Closed definitions cannot be edited, responses cannot be resubmitted, and student access never reveals another student's answers.

S1 is identified: answers remain account-linked in storage. Owner projections omit account identifiers, but text/small groups can still identify a person. Anonymous mode/export/history/notes remain later work.

Ctrl+C closes both services and the API/session pool. Restart `npm run demo` against the same database/configuration to retain unexpired sessions/feedback. The optional tmpfs container is **disposable storage**, not evidence of durable storage after container removal. Remove only your own instance when finished:

```sh
docker stop lectra-demo-postgres
docker rm -v lectra-demo-postgres
```

## Build and verification

```sh
npm run typecheck
npm run build
npm test
npm run test:db
npm run check:orm
npm run browsers:install
npm run test:e2e
```

`npm test` runs units and API liveness checks. `test:db` and `check:orm` use the opted-in test configuration. `test:e2e` is the inherited web/proxy/auth-required tooling smoke at 360px/1280px, not the complete product journey. Browser binaries stay under ignored `.local/playwright-browsers`.

`npm run test:e2e:recovery` runs the real React UI at 360px/1280px with explicit HTTP fixtures on port 4175. It requires installed browser binaries but no database, credentials or running API. It tests session revalidation, revision reconciliation and uncertain mutation recovery; it is separate from the real database-backed product journey. Current review-fix evidence is in [PR #36 review fixes](docs/sprints/sprint-1/pr36-review-fixes.md).

For real feature integration, supply a **new empty** dedicated database in `.env.test.local` and set `ALLOW_FEATURE_TESTS` to that database name, then `npm run test:features`. The suite migrates/seeds itself and refuses existing tables; there is no reset command. For another run, create another new empty database. It verifies actual auth, role/ownership, lifecycle/revision, validation/rollback, duplicate/close/edit races, own readback, result projections/integrity and precise session expiry. `ALLOW_FOUNDATION_TESTS` and `npm run test:db:foundation` separately exercise the inherited nine migration/seed/constraint cases on their own new database. See [database setup](docs/sprints/sprint-1/database-foundation.md).

For selected product browser tests, create private ignored `.local/browser.env` containing NODE_ENV=test, APP_ORIGIN=http://127.0.0.1:4174, a random SESSION_SECRET, DATABASE_URL and TEST_DATABASE_URL pointing to the same **new empty synthetic test database**, DEVELOPMENT_DATABASE_URL pointing to the distinct actual development target, matching ALLOW_TEST_DATABASE/ALLOW_BROWSER_TESTS, and private SEED_OWNER_PASSWORD/SEED_RESPONDENT_PASSWORD. Then run `npm run test:e2e:features`. Preparation validates isolation, migrates and seeds; tests run real web/API on 4174/3102 and do not reuse another server. Use a new database per run. Screenshots contain only synthetic UI; traces are off to avoid recording credentials/tokens.

An actual built-process restart check is available as `node --env-file=<private-feature-env> --import tsx scripts/verify-restart.ts` after a feature run whose private RESTART_PASSWORD was supplied. It compares persisted identity/deadline/survey/own answers/results across stop/start without migration or reseed. This script never prints credential values.

For ordinary forward development migrations only, explicitly configure `.env` with NODE_ENV=development and ALLOW_DATABASE_MIGRATIONS matching the intended database, then `npm run db:migrate:dev`. It does not seed/reset. Production/proxy/HTTPS deployment remains unverified Lab 5 work. To start the built API use `npm start` with the appropriate private `.env`; serve the built web behind the same reviewed origin before any deployment.

Actual teammate fresh-checkout reproduction, full contract-case completion, reviewed staging/main integration and assessed release/PDF evidence remain pending. Report real failures/skips and test the final release commit rather than treating a feature-branch pass as release acceptance.
