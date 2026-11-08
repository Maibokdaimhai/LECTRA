# Issue #15 - Bounded Workspace Setup Design

Version 0.1, 2026-11-07. Recorded before setup implementation on `chore/15-sprint1-workspace`, from staging `090a5288ac57085d7d7107744d976c31ffd8192d`. Owner-authorized work: #15 tooling and #13 contract drafting. No domain implementation, human review, Git publication or release is claimed/authorized by this document.

## Scope and selected runtime

Create npm workspaces `apps/web` (React/Vite/TypeScript) and `apps/api` (Express/TypeScript), one root lockfile, shared cool-theme CSS tokens, local same-origin /api proxying, real build/typecheck/Vitest/Supertest/Playwright commands, safe configuration/test-database guards, predictable startup/shutdown and a minimal liveness endpoint/page. No auth/survey/answer/results behavior, memory session store, seed/migration for domain entities, Docker application packaging, CI or GCP setup.

Actual available verification runtime: Node 24.22.1 (Codex bundled binary); system Node 22.17.1 is not the selected runtime. Pin Node 24.22.1 and npm 10.9.2 (available on this host), one npm lockfile, PostgreSQL 17 image for disposable local checks. This replaces F-01's uninstalled npm 11.16.0 candidate for this setup; record the actual compatibility outcome instead of claiming candidates were installed unchanged. No global runtime installation or version switch is performed.

Package candidates verified against npm metadata before installation: React/react-dom 19.3.1, Vite 8.3.6, plugin-react 6.2.1, TypeScript 5.9.3, Vitest 5.1.0, Express 5.3.0, Zod 4.6.7, Supertest 7.3.1, Playwright 1.65.0, tsx 4.23.15; Node types 24.19.2, Express types 5.0.6, React/react-dom types 19.3.0, Supertest types 7.2.1. ORM/session/hash candidates remain Prisma/client/adapter-pg 7.10.1, pg 8.23.1, session 1.19.0, connect-pg-simple 10.0.0, argon2 0.45.2 and rate-limit 8.7.3. Pin direct dependencies exactly; inspect install/peer/native failures rather than using force/legacy-peer-deps.

## Boundaries and checks

- API liveness only confirms process availability, not DB/auth readiness. Domain routes remain absent; no demo role selector or invented survey content.
- Local API binds loopback and Vite proxies /api; release configuration must validate HTTPS Origin before starting. No broad trust-proxy/CORS change. No small global JSON parser in front of future per-route 256 KiB parsers.
- Validate configuration safely before listening; errors name invalid fields without printing secrets/URLs. Keep .env/private local fixture/output files ignored; example values are placeholders.
- Test database connection requires an explicit allowlisted `lectra_test` or `lectra_test_*` name and matching opt-in name, and must differ from the development database target. Reject host/port query overrides in either URL so driver routing cannot bypass the target comparison. Validate before any SQL; no reset/migrate/seed command against an arbitrary URL.
- PostgreSQL checks use an isolated local container and dedicated DB, synthetic credentials and temporary transaction probes. They verify tooling/driver/transaction availability, not real User/survey schema or #16 completion. Do not modify pre-existing containers/databases.
- Write meaningful unit/API smoke checks for configuration safety and liveness/error behavior; selected real-browser proxy/page smoke at 360px/1280px. Native Argon2 and DB/ORM compatibility checks are setup observations, not F-01 credential/session verification.
- For the test-DB safety rule, retain actual intended-behavior RED/GREEN observations if exercised; uncommitted working-tree/source hashes must not be represented as commit history or release evidence.
- #16 supplies reviewed domain/session migrations/seed and generation against the real schema; #17 onward needs the feature contracts/shared agreements and actual dependency verification. #13 is specification only and will coordinate F-03/F-05 published definitions, lock ordering and readback.

## Intended local command interface

Root scripts will provide dev, build, typecheck, unit tests, API smoke tests, PostgreSQL tooling integration, selected browser smoke and production API start. Commands below become actual supported instructions only after their implementation/execution is recorded. DB/seed product scripts remain unavailable until #16; do not invent runnable migrations or a complete #24 product handoff.

Acceptance evidence must name actual commands, versions, files/cases and observed pass/fail/skip counts. Until observed, all setup results are Not run; docs/verification-results will record working-tree checks with their limits. No claimed feature coverage, reviewer approval or Git operation is inferred from this design.

Primary implementation references: [Vite](https://vite.dev/guide/), [Vitest](https://vitest.dev/guide/), [Express](https://expressjs.com/en/starter/installing/), [Playwright webServer](https://playwright.dev/docs/test-webserver), and the existing F-01/shared contracts. Teacher authority remains the two supplied PDFs; exact setup versions/commands/checks here are team choices.

Observed implementation outcomes are now recorded separately in [workspace verification](workspace-verification.md). The intended checks above remain the setup design; the verification record states what actually ran and its limits.
