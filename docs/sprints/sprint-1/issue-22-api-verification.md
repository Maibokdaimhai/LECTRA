# Issue #22 — integrated API and PostgreSQL verification

Prepared 2026-11-09. Base: merged staging `d096a17c57b9ad0f49ec539a96905f729697100b`, after PR #35 and the approved PR #36. Tested commit: `40d8ea1` (full SHA in [actual results](issue-22-verification.json)). This change adds tests and evidence; application code, migrations, dependencies and browser files remain identical to that integrated baseline. No main release or new teammate approval is claimed.

## Issue acceptance evidence

| Issue #22 acceptance item | Actual evidence and boundary |
| --- | --- |
| Reuse feature suites and fill meaningful cross-feature gaps | Extended the existing `apps/api/tests/features/workflows.test.ts` with INT22-01–11, retaining its 21 existing scenarios. Eleven new combined scenarios cover real HTTP/routes/PostgreSQL; assertions within loops do not become invented runner counts. |
| Authentication, wrong role, same-Course ownership, eligibility, own-only access | Existing real session/identity/expiry/CSRF/replay suites plus INT22-02/06. Separate respondents submit distinct values, spoofed actor headers still read the trusted actor's value, selector queries are rejected, owner/foreign roles cannot retrieve answers/results or mutate a foreign survey. Exact own projection keys and safe errors are inspected. |
| Unique creation, edit/publish, duplicate submit, rollback and both close/submit lock orders | INT22-01 concurrent create; INT22-10 held-row save-first and publish-first; retained real-route close/submit barrier case in both orders; retained concurrent duplicate case; INT22-04 faults after each write stage and successful retry; INT22-02 frozen structure/membership checks. |
| Actual answer-derived results, optional denominators, frozen scale meaning and privacy | INT22-03 two persisted respondents with different required ratings and one optional rating. Optional blank text omits its row, unanswered rating returns null/all-zero bins, response count is not multiplied by answers. Published projection is count-only; Closed results preserve scale meaning and omit identity/bundle/session markers. INT22-09 covers an entirely unanswered Closed survey. |
| Actual process restart and unchanged storage | `scripts/verify-restart.ts` starts/stops/restarts the built API with unchanged database/secret. Identity/session deadline, frozen survey, own answers and Closed results match before/after; there is no migration/reseed between starts. |
| Safe isolation, reproducibility and actual versioned results | New explicit opted-in disposable primary/foundation databases; another independent new database repeats all 32 API/PostgreSQL scenarios successfully. Exact ten commands, counts and source SHA are in the safe result snapshot. No existing user development database was migrated/reset/seeded. |
| Defect links and current AC/test traceability | R1–R4/N1–N5 actual review/fix history remains in the two prior correction records and retained tests. This run found no new application defect requiring a fix. New [coverage inventory](issue-22-coverage.json) enumerates all 113 feature AC and 183 planned STS rows with conservative evidence/disposition, rather than marking old planned documents Passed. |

## Added scenarios and related planned cases

All are in the existing real feature suite. `INT22-*` is an actual runner-scenario prefix, distinct from the preimplementation `TEST-Fxx-*` design IDs.

| Actual scenario | Added coverage | Related planned IDs (selected assertions, not whole-matrix completion) |
| --- | --- | --- |
| INT22-01 | Two simultaneous creates: one 201, one recognized 409, exactly one revision-1 Draft | TEST-F03-I03 |
| INT22-02 | Removed member retains frozen eligibility; new member remains ineligible; Published PATCH/delete rejected; metadata unchanged | TEST-F03-I14; TEST-F04-I09 |
| INT22-03 | Ordered own answer readback; own discovery flag changes after commit; optional omission, zero bins/null, exact means/scales and safe Published/Closed projections | TEST-F02-H02; TEST-F04-I01/U06/H03; TEST-F05-I03/I05/I08 |
| INT22-04 | Real AFTER INSERT fault after Participation, ResponseBundle and Answer; all three tables empty afterward; explicit retry succeeds once | TEST-F04-I13/I11 |
| INT22-05 | Real ordinary UTF-8 and surrogate-escaped JSON, 2000/2001 code points, NUL/unpaired surrogate, exact valid whitespace-preserving readback | TEST-F04-I04 |
| INT22-06 | Same-Course foreign owner GET/PATCH/delete/publish/close denial, role/CSRF/guest checks, two actual respondents, ignored spoof headers, exact own allowlist | TEST-F01-H02/H03/H04; TEST-F04-I08/I17/I21; TEST-F05-I02/I07 |
| INT22-07 | Real HTTP chunked stream without Content-Length: exact 262144 bytes accepted, 262145 rejected; compressed and malformed requests rejected with zero writes | TEST-F04-I07 |
| INT22-08 | Hold the real Survey lock through the native five-second timeout; safe 503, no writes, persisted status false and explicit retry succeeds | TEST-F04-I20 (known lock-timeout branch only) |
| INT22-09 | Participation without bundle returns safe own-status 500; cleanup restores fixture; zero-response Closed analytics returns null/zero bins | TEST-F04-I16; TEST-F05-I05 |
| INT22-10 | Barrier both save/publish lock orders: stale revision versus invalid state, wholly consistent definition/revision/eligibility | TEST-F03-I15 |
| INT22-11 | More than twenty persisted scoped surveys; deterministic date/sequence order, distinct pages, beyond-last totals, foreign exclusion, valid limits and malformed bound/query rejection | TEST-F02-I12/I13/I14 |

Fixtures use synthetic content and actual role/session/CSRF composition. Test-only triggers/views and independent lock-holding connections stay in the opted-in test database; there is no production fault endpoint or application bypass. The five-second timeout test waits for an actual PostgreSQL error, not an arbitrary timing assertion. The chunked request writes through a local HTTP server and the actual application reader. Rollback checks inspect persisted rows after the failed transaction.

## Actual final results

Runtime: Node 24.22.1, npm 10.9.2, PostgreSQL 17.11. The source includes no new dependency. Current commands and their exact private configuration filenames are retained in [verification JSON](issue-22-verification.json); private configurations themselves are ignored and mode 0600. A reproducer must supply their own explicitly allowlisted new test targets/credentials, following README's test-database protections.

| Primary check | Actual result |
| --- | --- |
| `npm run typecheck` | Passed, including API/web/tooling. |
| `npm run build` | Passed, including Prisma generation and API/web builds. |
| `npm run test:unit` | 37 passed. |
| `npm run test:api` | 2 passed. |
| `vitest.features.config.ts` on the primary new DB | 32 passed. |
| `vitest.foundation.config.ts` on its own new DB | 9 passed. |
| `vitest.db.config.ts` | 2 passed. |
| Actual Prisma/PostgreSQL adapter SELECT | Passed. |
| Built API process restart | Passed with unchanged persisted content/deadline and no migration/reseed between starts. |
| Feature suite repeated on a second independent new DB | The same 32 scenarios passed again. This is repeatability evidence, not 32 additional distinct tests. |

**82 primary selected tests passed**, no final failures/skips. The repeated feature suite adds 32 successful executions of the same scenarios; it is not a claim of 114 distinct tests. No browser suite was run for this Issue #22 increment; #23 remains the teammate's separate browser/E2E scope. Earlier 115-test feature-branch results remain historical and are not silently combined with this run.

Raw local outputs are ignored `.local/evidence/issue22-final-00.txt` through `09.txt` and `issue22-final-results.json`. They are local files, not published attachments. Safe source/counts/commands are tracked. The preliminary first run contained ten of the eleven additions and passed 31 scenarios; the final complete 32-scenario suite and its independent repeat are the evidence reported above. No new business-rule failure was observed and no retrospective RED commit is fabricated. Genuine prior failing-before/passing-after history remains in the merged implementation/review commits and their dated evidence records.

## Coverage accounting and remaining decisions

The [machine-readable inventory](issue-22-coverage.json) contains 113 contract AC, 183 planned STS records, their literal planned source row, and actual source/scenario links where inspected. It maps selected evidence for 104 planned cases. **Every mapped planned case is conservatively Partial**, because combined planned cases contain more parameter/fault/proxy/interaction subconditions than any one executed assertion proves. Unmapped rows remain explicit gaps; UI/manual rows identify their separate owner instead of being labelled failed or passed. These are coverage dispositions, not runner pass counts or a coverage percentage.

This change satisfies the bounded integrated verification work described in the Issue #22 acceptance table for teammate review. It does not waive individual feature contracts or certify complete Product DoD. Before an assessed release, both teammates must disposition remaining planned-case gaps against their acceptance standard and record any required additional checks/fixes. Examples still not fully demonstrated here: the entire auth save/destroy/lookup fault matrix and production HTTPS/proxy profile; count/items and results under every concurrent snapshot permutation; every F-03 mutation failure stage; genuine lost commit acknowledgment/deadlock variants; safe-log spies; and the full browser/manual focus/zoom/expiry matrix. No silently inferred pass closes those gaps. Production deployment checks and later P15 usability have no invented result.

## Teammate handoff

Review only this branch's changes from staging; application and browser files are unchanged, so #23 can proceed independently from the same integrated baseline. Inspect the new test assertions/barriers, the exact runner counts and conservative inventory. Existing first-pass/second-pass review evidence remains relevant to the unchanged application, but does not constitute approval of these new tests.

A subsequent integrated staging check should use the actual post-merge SHA. #24 still needs the teammate's real clean-checkout reproduction. #25 still needs a separately reviewed staging-to-main release and required checks on the assessed version. #26 must regenerate its final PDF against actual accepted release evidence and confirmed contributions; the earlier PDF remains a pre-review draft. No main merge, tag, submission or claim of timely delivery is made here.

## Evidence correction after PR #37 review — 2026-11-10

[The actual review](https://github.com/Maibokdaimhai/LECTRA/pull/37#pullrequestreview-5832194353) identified an unsupported mapping for TEST-F02-I10. INT22-03 checks discovery participation flags but does not change Membership; INT22-02 changes Membership and checks detail/submission, not discovery. Neither establishes discovery behavior after membership changes. Removed the cited INT22-03 evidence, left TEST-F02-I10 explicitly Not demonstrated, and cleared AC-F02-08's selected-evidence list. The 113 AC and 183 planned-case records remain; the selected partial-mapping count is corrected from 105 to 104. No passing runner scenario is removed or relabelled.

This is an evidence-only correction: application/tests/configuration are unchanged from tested `40d8ea1`. The earlier 82 primary test results and 32-scenario repeat retain their original source reference and were not rerun or relabelled as checks on this documentation commit. The reviewer independently reports 32 feature/API/PostgreSQL, 37 unit and 2 API liveness passes; the full foundation/tooling/restart evidence remains separately author-reported. No overall renewed approval is inferred.
