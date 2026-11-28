# F-06 anonymous rating verification

28 November 2026 ICT. Contract v0.2 at `9bfe065`, with review disposition in [the contract PR](https://github.com/Maibokdaimhai/LECTRA/pull/79). This is a local implementation checkpoint, pending teammate code review and integrated release.

| Evidence | Actual result |
| --- | --- |
| RED at `ff891ce` | Vitest feature suite with `-t TEST-F06` on fresh PostgreSQL 17. The intended anonymous Draft save expected HTTP 200 and received 422 on the old code. 1 failed, 43 filtered out. |
| GREEN at `d417255` | Full `vitest.features.config.ts` on PostgreSQL 17. 45 passed, 0 failed/skipped. Verified mode lifecycle, concurrent duplicate rejection, status-only own GET/POST across relogin, role/ownership guards, no identity stored in the anonymous bundle, SQL storage guards, and the rating-specific 4/5 and 2/3 boundaries with survey response count remaining 10. |
| Build | `npm run typecheck`, `npm run build` and `npm run test:unit` passed. The unit suite had 70 passed. |
| Real browser | `node scripts/playwright.mjs test --config playwright.features.config.ts` on PostgreSQL 17. 24 passed, including TEST-F06-E01/E02 at 1280 and 360 CSS pixels. Verified rejection when switching a Draft that contains TEXT, explicit removal, published disclosure, status-only student display and suppressed results. |
| Earlier mode safety | `vitest.post-release.config.ts` on a fresh PostgreSQL 17 database: 5 passed. The existing unknown-mode exercise now uses a test-only FUTURE_MODE label while ANONYMOUS is supported. |
| Upgrade | Applied Prisma migrations to a separate PostgreSQL 17 database. Inserted a Closed identified response under the old schema, applied the new migration and confirmed identical state, identity reference and 1,500-code-point text length. |

SINGLE_CHOICE privacy coverage depends on F-07. Export and trend consumers depend on F-08 and F-09 respectively. There is no production deployment or code review claim for this branch.
