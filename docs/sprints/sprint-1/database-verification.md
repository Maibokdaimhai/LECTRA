# Issue #16 — Database verification record

Observed 2026-11-08 on the owner's existing `feat/16-sprint1-database` working tree. These are actual local observations, not a commit/release SHA, human approval or executed F-01–F-05 STS. Scope/design and reproducible normal commands: [database foundation](database-foundation.md). Issue acceptance source: [Issue #16](https://github.com/Maibokdaimhai/LECTRA/issues/16), read without modifying it.

## Environment and isolation

- Selected Node **24.22.1**, npm **10.9.2**, Prisma/client/adapter **7.10.1**, PostgreSQL **17.11**. Global Node 24.14.0/npm 11.9.0 were left unchanged. Official Node checksums and npm package integrity were verified before local extraction into ignored `.local/issue16-1b0a4addfed2/`.
- Docker daemon was unavailable. Official EDB portable PostgreSQL 17.11 binaries were downloaded into that same ignored directory; no installed PostgreSQL service or existing container was changed. Archive SHA-256: `6eabdf00d2893713b75db4336a23c3fdf505f056e217ec6e2e95d901750cfea3` (recorded download hash).
- A new private cluster under `data17`, loopback port 55417, contained new databases `lectra_test_issue16` and `lectra_test_issue16_cli`. Explicit URL/name opt-ins and a distinct configured development reference were used. There was no existing root `.env`/`.env.test.local` to overwrite; verification used new ignored `test17.env` / `cli17.env`. Credentials were random, private and never printed.
- Earlier supplemental checks used a separately initialized PostgreSQL 18.1 cluster at port 55416 because only that major was initially installed. Those observations are supplemental; the final foundation suite uses **17.11**. Both new test servers were stopped. No development/deployed database was reset, migrated or seeded.
- Source/config/lock manifest: **51 files**, SHA-256 `81dcfbe3d71b9f2f994229d635f62831319dfe3cfa451cc1dc7bc43134658f5f`, stored in ignored `.local/issue16-1b0a4addfed2/source-manifest.json`. It excludes generated/build/dependency/local-secret files and Markdown. Root lockfile SHA-256: `16cd3e46818cebbad5467047e68057bda8e842099e96e9b9d6ee7d93c4c85ecb`; accepted guard SHA-256: `f9d2525c87bcd04c75d58e9bc09e1faff81fb78caae7ed54ee94684fe33b24eb`. No dependency version or guard behavior was weakened.

## Executed commands and results

Commands ran from the repository root with the locally selected pinned runtime. `<private>` below is `.local/issue16-1b0a4addfed2`; it identifies a real ignored directory, not a committed configuration or secret value.

| Actual command / operation | Observed result | Evidence boundary |
| --- | --- | --- |
| Pinned npm CLI `ci --no-audit --no-fund` | Exit 0, 322 packages added; preinstall runtime guard passed | Existing lockfile; no audit/security result is inferred from `--no-audit`. |
| `npm run db:validate` | Valid Prisma schema, exit 0 | Real Prisma 7.10.1 validation. |
| `npm run db:generate` (also through build/typecheck) | Real client generated, exit 0 | Generated TS is ignored, compiled with API; not an applied migration. |
| `npm run typecheck` | Exit 0, including final post-edit check | API, web, tooling/config and foundation-test TypeScript. |
| `npm run build` | Exit 0 | API/generated client and Vite production build. |
| `npm run test:unit` | **31 passed, 4 files**, exit 0 | Configuration 11; accepted DB guard 14; native Argon2 1; new seed preconnection guards 5. |
| `npm run test:api` | **2 passed, 1 file**, exit 0 | Existing liveness/absent-domain-route checks only. |
| `node --env-file=<private>/test17.env node_modules/vitest/vitest.mjs run --config vitest.foundation.config.ts` | **9 passed, 1 file**, exit 0 | Real PostgreSQL 17.11, new initially empty dedicated DB; ALLOW_FOUNDATION_TESTS matched target. |
| `node --env-file=<private>/test17.env node_modules/vitest/vitest.mjs run --config vitest.db.config.ts` | **2 passed, 1 file**, exit 0 | Existing PostgreSQL 17/UTC and temp-transaction tooling checks. |
| `node --env-file=<private>/test17.env --import tsx scripts/orm-smoke.ts` | Exit 0 | Existing generation/adapter SELECT probe; not an extra automated-test count. |
| Import built `apps/api/dist/database.js` with Node | Export is a function, exit 0 | Compiled generated-client integration imports without opening a pool. |
| Guarded CLI `migrate-test`, `seed-test`, `seed-test` via `cli17.env` | All exit 0 on the second new DB | Actual wrapper, forward migration and repeated synthetic seed; no reset. |
| Guarded CLI `migrate-dev` with that test profile | Refused, exit 1 as expected | Development migration opt-in cannot be satisfied by the test profile. No seed/migration ran through the rejected branch. |
| Stop/restart private PostgreSQL 17 cluster; read `foundation-store` | One persisted connect-pg-simple row with stored auth deadline | Native persistence/readback, followed by confirmed server shutdown. Does not test F-01 login/session middleware policy. |

Final Vitest total: **44 passed**, **0 failed**, **0 skipped** across the listed unit/API/foundation/tooling suites. The 8 SQL assertion groups reused inside one foundation case are not counted as additional Vitest tests. Browser/E2E was not rerun for this persistence-only change; no UI/endpoint implementation was added.

The 9 foundation cases actually verified fresh/no-op Prisma migration deployment; repeat seed preserving IDs/hashes/sessions; conflicting seed refusal; local PK/FK/CHECK/Unicode/reorder/rollback assertions; typed Prisma date/owner reads; no-op schema comparison retaining auth_session; connect-pg-simple set/get with UTC; genuine concurrent uniqueness with the loser observed waiting on a lock before SQLSTATE 23505; and seed repetition preserving stored submitted associations. Read-model/response API tests remain future feature work.

## Failures, corrections and TDD limits

- Initial non-escalated download access failed through the configured proxy. Approved official downloads enabled local pinned tools; no engine pin/preinstall check was bypassed.
- Initial build/unit/API attempts hit sandbox `spawn EPERM` before their tests ran. The same commands passed with permitted subprocess/socket execution. These are environment failures, not intended-behavior TDD RED.
- The first supplemental PostgreSQL 18 SQL run expected 23503 for restrictive deletion; the server correctly rejected deletion with 23001. The assertion was corrected to accept those two specific FK rejection codes while still failing successful deletion/other errors. The corrected SQL passed on 18.1 and subsequently inside the full 17.11 suite. This is a portability-test correction, not invented business-rule RED/GREEN.
- Sandbox-owned PostgreSQL 18 workers prevented normal shutdown. Cleanup verified the new cluster's command line/PID/descendants and stopped only those processes. A readiness-checked recovery readback passed; final 17.11 startup/shutdown used the permitted private process path and completed cleanly. One earlier recovery read was attempted before readiness and failed; it is not reported as passing.
- No genuine new preimplementation RED/GREEN history or Git commits were captured for #16. Do not relabel the environment/portability failures or prior #15 guard history as #16 domain TDD. Preserve the actual observations and retain real history for subsequent feature work.

## Issue #16 acceptance coverage

| Issue acceptance item | Implemented storage / observed verification |
| --- | --- |
| Version Prisma/custom session/constraint migrations for all S1 entities | Three migrations; 12 application/session tables plus Prisma migration metadata; real fresh deploy, no-op redeploy and schema diff passed. |
| PK/FK/unique/CHECK/index responsibilities | Actual same-survey FKs, uniqueness, typed values, 1–5 ratings, Unicode limit and restrictive deletion checked. Ownership/role cross-table invariants remain authoritative service responsibilities; seed validates its own canonical owner/role fixtures. |
| Persist scale meaning and revision | Native stored min/max/labels/interpretation, required/type/order and positive definitionRevision. Draft blanks/reorder staging supported; publication validity/freeze requires #19. |
| Repeatable synthetic hashed fixtures and isolation contexts | Actual seed/reseed and Argon2 verification passed; same-Course/different-Owner, ineligible/unenrolled, empty contexts and stable IDs provided. No committed passwords or real students. |
| Fresh migration/seed and safe repeats | Foundation suite plus independent CLI smoke passed; conflicts refused and existing submitted rows/session/hash values retained. No startup seed/reset. |
| Dedicated test DB protection and schema/session ownership | Accepted guard unchanged and passing; additional foundation/seed opt-ins; empty-DB assertion; mapped custom session table, actual store roundtrip and restart readback. |
| Real-DB migration/constraint/relationship results | 9 foundation and 2 tooling DB cases passed on 17.11; versions, commands and working-tree hash recorded above. |

Storage implementation is ready for teammate review. No Issue closure, human approval, feature-level F-01–F-05 acceptance, production migration, release, contribution record or PDF completion is claimed. Seed is intentionally limited to explicitly opted-in disposable synthetic targets; development forward migrations never run it. Live service role/ownership, publication/immutability, atomic response validation/locks, access projections and full middleware lifetime policies remain #17–#21 work.
