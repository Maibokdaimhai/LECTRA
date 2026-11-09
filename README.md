# LECTRA

Lecture Evaluation, Classroom Thoughts, Reviews & Analytics - CPE334 lecture feedback project.

Current implementation includes workspace/tooling (#15) and the Sprint 1 database foundation (#16): Prisma schema, versioned PostgreSQL/session constraints, guarded synthetic seed and storage tests. Login, surveys, responses and results UI/API workflows are not implemented. [Engineering docs](docs/README.md) and [database foundation/setup](docs/sprints/sprint-1/database-foundation.md).

## Prerequisites and install

Use **Node 24.22.1**, **npm 10.9.2** and PostgreSQL **17** for these checks. Select Node with your own runtime manager; no global runtime installation/switch is performed by the project. Check `node --version` / `npm --version` before installing. Exact direct dependencies and one npm lockfile are retained; runtime choices/results are in [workspace setup](docs/sprints/sprint-1/workspace-setup.md).

```sh
npm ci
npm run setup:local
npm run dev
```

`setup:local` creates ignored mode-0600 `.env`, `.env.test.local` and `.local/postgres.env` with synthetic random local secrets. It refuses to overwrite any existing configuration. Review examples in `.env.example` / `.env.test.example`; never commit actual secrets. Web: `http://127.0.0.1:5173`; API loopback port 3001, proxied through same-origin `/api`. Ctrl+C stops both services. Liveness does not connect to the database and does not prove authentication/DB readiness. No frontend role selector or fake product data is provided. Build/typecheck generate the real Prisma client before compiling; generated source is ignored.

## Disposable PostgreSQL tooling checks

Use a **new** local PostgreSQL 17 test instance, with `lectra_test` distinct from your development target. Optional Docker command below uses the files created by setup:local. Confirm port/name are free; do not replace another person's container. This is a disposable test DB in tmpfs, not persistent product storage or a Docker application deployment.

```sh
docker run --name lectra-tooling-postgres --env-file .local/postgres.env --publish 127.0.0.1:55432:5432 --tmpfs /var/lib/postgresql/data -d postgres:17-alpine
docker exec lectra-tooling-postgres pg_isready -U lectra -d lectra_test
npm run test:db
npm run check:orm
```

The test runner validates `TEST_DATABASE_URL`, explicit `ALLOW_TEST_DATABASE` matching `lectra_test`/`lectra_test_*`, and a different canonical development target **before SQL**. Keep `.env.test.local`'s DATABASE_URL aligned with the actual development target if you edit configuration. Existing tooling DB tests use temporary transaction probes; ORM smoke generates an ignored probe client and reads without domain migration. Issue #16 adds separate guarded migration/seed commands and a foundation suite: see [database setup](docs/sprints/sprint-1/database-foundation.md). That suite requires an additional explicit opt-in and a new empty test DB; do not pre-migrate it or reset any existing database. No reset command is provided.

When finished, stop/remove **only the container created by the command above**; its disposable test data is intentionally lost:

```sh
docker stop lectra-tooling-postgres
docker rm -v lectra-tooling-postgres
```

## Actual check commands

```sh
npm run typecheck
npm run build
npm test
npm run test:db
npm run check:orm
npm run browsers:install
npm run test:e2e
```

`npm test` runs meaningful configuration/test-database-safety/native-hash units and two API liveness/absent-domain-route checks. DB/ORM checks require the isolated DB above. Browser installation stays in ignored `.local/playwright-browsers`; smoke runs real web/API processes on 4173/3101 at 360px and 1280px, closes them afterward and does not reuse a different running server. Its process configuration deliberately does not connect to a domain database. These are tooling checks, **not F-01-F-05 acceptance tests**. Actual outcomes and uncommitted-source limitations: [verification record](docs/sprints/sprint-1/workspace-verification.md).

After build, `npm start` runs the local API on the configured loopback port; only `/api/health` exists. This is not an integrated production UI/static-server or deployment release. Actual product reproduction/demo instructions and teammate clean-checkout verification remain #24; Docker application packaging, completed CI/CD and GCP delivery remain Lab 5.
