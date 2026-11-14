# Episode 2 verification record

Actual local execution on **14 November 2026**, using Node 24.22.1/npm 10.9.2, PostgreSQL 17 in a new dedicated container and eight new test databases. This is local production-profile and regression evidence, not a GCP deployment result.

**239 passed / 0 failed / 0 skipped** across the selected Vitest/Playwright suites. Typecheck, build, ORM and actual built-process restart also exited 0. All **16 commands** in `results.json` exited 0. The exact candidate source/config/test/runner content is identified by **79 SHA-256 entries** in that file; its `baseCommit` is the accepted main commit before this implementation, not a claim that uncommitted changes existed in the historical release. The final PR commit is identified in GitHub and can be compared with these hashes.

| Log | Actual result |
| --- | --- |
| `01-typecheck.txt` | Typecheck and Prisma generation passed |
| `02-build.txt` | API/web build passed |
| `03-unit.txt` | 53 passed |
| `04-api.txt` | 3 passed |
| `05-cloud.txt` | 7 passed, real PG and built production process |
| `06-features.txt` | 41 passed |
| `07-release.txt` | 7 passed |
| `08-foundation.txt` | 9 passed |
| `09-tooling.txt` | 2 passed |
| `10-postrelease.txt` | 5 passed |
| `11-orm.txt` | Typed ORM/database smoke passed |
| `12-restart.txt` | Sessions, deadlines, survey, own answers and results survived built-process restart |
| `13-ui-recovery.txt` | 84 passed |
| `14-ui-tooling.txt` | 4 passed |
| `15-ui-domain.txt` | 22 passed |
| `16-ui-logout.txt` | 2 passed |

Test implementation and assertion IDs: `apps/api/tests/unit/cloud-config.test.ts` (5), `unit/production-database.test.ts` (7), `api/readiness.test.ts` (1) and `cloud/runtime.test.ts` (7). These 20 new cases increase the prior selected 219-test matrix to 239 for this candidate. Historical Sprint 1 counts/evidence are unchanged.

RED: `red-runtime.txt` preserves six pre-implementation assertion failures. Earlier runner restrictions and the initial Docker bootstrap race are separately recorded; they are not mixed into successful application-test counts. Read the [six-point matrix](../../episode-2-cloud-readiness.md#six-point-disposition-and-evidence) and source assertions when assessing what each result proves. Static inspection and non-applicability decisions are not counted as passing automated tests.

No teammate approval or completed staging merge is claimed by this record. Those remain the human review/merge gate for closing #51.
