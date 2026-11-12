## Purpose and current candidate

Refs #25 and #8. Sprint 1 release from **staging to main**, identified F-01–F-05 only.

Current staging **base**: `fa33e4cc2b57e5c140ffca892e507814b436829d`. Final closure reproduced Major **DEF-G04-01** on that source and verified a minimal working-tree correction. **Do not approve unchanged `fa33e4c` for main.** Obtain actual review/integration of the prepared fix/tests/evidence, then replace this base reference with the real resulting staging/review SHA before approval. This description is prepared for manual pasting; GitHub has not been updated. No future commit or approval is invented.

## Reviewed corrections already integrated

- PR #42: atomic session/absolute-expiry persistence and failed-save/regeneration cleanup. Correction tested at `cccb1c02973e3cee47fd10a63f6769b6523e9c6c`; head `4f25a153ba505eb95345971fee68e94195366a94`; [R1NNE0 approved](https://github.com/Maibokdaimhai/LECTRA/pull/42#pullrequestreview-5863694268); merged as `2961014e6b21668f20321e0acade382e67972f1a`.
- PR #43: UI-F01–F03 question focus recovery, safe linked validation and confirmed-submission focus. [Maibokdaimhai approved](https://github.com/Maibokdaimhai/LECTRA/pull/43#pullrequestreview-5871353742) `b75bf35210d5375ef3e48f3e74d943ccb7f8f5f1`; merged as current candidate `fa33e4c`.

These approvals cover their bounded corrections, not this main-release PR.

## Final closure correction — awaiting review/integration

DEF-G04-01: the shared domain transaction helper did not handle the `error` event of its checked-out PostgreSQL client. Physical connection loss after actual COMMIT produced uncaught errors (ordinary Node process termination risk), even though the request had an error path and data was durable.

The sole production change is `apps/api/src/feedback.ts`: listen while checked out, preserve the original failure, discard broken clients, avoid a false rollback guarantee after connection loss, and remove the listener after release. No API/schema/dependency/frontend change or automatic write retry.

The original run exited 1 with two uncaught errors despite seven assertion passes. Strengthened regressions then gave **2 failed / 5 unselected skipped / 2 uncaught errors** before the fix. Final verification: **7 targeted PostgreSQL + 38 existing API/PostgreSQL + 4 selected real browser/API/PostgreSQL executions passed (49), zero failures/skips/uncaught errors**, plus typecheck/build. This is an uncommitted working tree on `fa33e4c`, bound by 79 source/test/config hashes in `g04-final-verification.json`; it is not a claim that staging already contains the correction.

The new checks cover real postcommit TCP acknowledgement loss for auth/Draft/submission, create rollback, an actual generated deadlock, injected PostgreSQL 40001 rollback and a positively exercised logging boundary. Fresh guarded empty databases/clusters were used and stopped; no development/shared storage was accessed. These are additional selected checks, not a rerun of the historical matrices.

## Actual source-bound evidence

- Historical fresh setup: **138 selected passes** at `037cb3f69db4b37b8363b9f4bdca9c277d02624c`; separate original demonstration at `4ff4562`. Counts and execution sources remain unchanged.
- Authentication correction: **144 selected passes** at `cccb1c0`, author-recorded. #42 reviewer separately reports **10 focused PostgreSQL passes**; the full matrix/restart remains author-reported.
- Recovered supplementary review: **12 actual passes** on `2961014`, original command/assertions/output recovered. Relevant sources matched base `fa33e4c`; the later transaction lifecycle patch is separately verified above. No rerun or addition to the historical 144 count; original snapshots/fault results retain their old execution source.
- UI correction: **41 unit / 74 mocked HTTP-browser / 22 real browser-API-PostgreSQL / 4 smoke passes**, plus typecheck/build; original working-tree execution is hash-bound to reviewed `b75bf352` and merge `fa33e4c`. #43 reviewer reports independent reproduction. In the final patch, 75/76 hashes still match (only backend `feedback.ts` differs); all frontend/fixture/configuration and eight screenshot hashes remain unchanged. 320px/native 200% zoom evidence is reused, with four selected normal/rejection browser journeys rerun after the backend change.

Do not sum overlapping matrices as distinct tests. The earlier recovery phase ran no application tests; final closure did run the 49 selected post-fix executions above. Historical results/counts, schema/migrations/dependencies, existing tests and frontend files remain unchanged. The later production correction still requires actual teammate review.

Evidence files under `docs/sprints/sprint-1/`: `release-readiness.md`, `release-history.json`, `pr40-auth-save-fix.md` (canonical G-04 register), `g04-final-verification.json`, `g04-supplementary-verification.json`, original authentication/UI/setup verification records and historical #22/#23 evidence.

## G-04 proposals and remaining limits

The canonical register proposes nonblocking **local Sprint 1** dispositions for A–G, supported by recovered evidence and inspected shared transaction/snapshot/error mechanisms. These are recommendations for actual owner/opposite-member acceptance, not accepted waivers or blanket Passed STS rows.

Remaining Partial/Not run boundaries include exhaustive SQL/wire timings, naturally generated SERIALIZABLE write skew, stopped-server/every-stage outage profiles, exhaustive logger/analytics boundaries, human screen-reader testing and full WCAG certification. Physical COMMIT-ack loss and an actual deadlock now have separate targeted evidence. Original injected 40P01 remains distinct; new 40001 is injection, not native SSI. Original zero-entry logging evidence is supplemented by an actual invoked logger, not rewritten.

Later HTTPS/proxy/distributed deployment and P15 work are separated from mandatory local session/Origin/CSRF/privacy/UI behavior. Mixed-scope AC/STS are not labelled wholly N/A. Historical planned inventories remain Partial/Not run where appropriate.

## Product DoD status

| Criterion | Proposed current status |
| --- | --- |
| DOD-01 | Applicable AC evidence assembled; human acceptance pending. |
| DOD-02 | Satisfied: recorded design/contract-before-implementation history. |
| DOD-03 | Satisfied: meaningful source-bound unit evidence; pure logic unchanged by this fix. |
| DOD-04 | Satisfied with documented limits in corrected tree: real persistence/rollback/concurrency/ack-loss checks. |
| DOD-05 | Satisfied with documented limits: real browser journeys and applicable retained UI accessibility checks. |
| DOD-06 | Satisfied with limits: genuine historical RED/GREEN plus two DEF-G04-01 failing-before/passing-after regressions. |
| DOD-07 | Satisfied with limits, proposed for human acceptance: real access/projection/safe-error/logging evidence. |
| DOD-08 | Satisfied with limits at tested working-tree scope: 49 selected passes, typecheck/build and hashes; actual integrated/main execution not claimed. |
| DOD-09 | New correction review/integration and substantive release approval pending; earlier feature/#42/#43 approvals retained. |
| DOD-10 | Setup/docs/limitations reconciled; fresh setup remains source-bound, not newly rerun. |
| DOD-11 | Actual reviewed main integration, post-main checks and immutable release evidence pending. |

## Required human acceptance and release execution

- [ ] Actual teammate review/integration of DEF-G04-01 correction; identify resulting staging SHA and match its source to final recorded hashes. Do not approve the unchanged base.
- [ ] Owner/opposite-member reviewer accepts each canonical A–G applicability/evidence/limitation/disposition and DOD-01–11 assessment at the actual reviewed version; resolve any specifically rejected boundary first.
- [ ] Obtain substantive opposite-member approval of this staging-to-main release. Feature/correction approvals do not approve #40.
- [ ] Perform only authorized reviewed main integration; record actual merge and checked-out main SHA.
- [ ] Run required release checks on that actual main SHA using fresh explicitly allowlisted isolated databases, including `node node_modules/vitest/vitest.mjs run --config vitest.release.config.ts` with its own **new empty target**, matching `ALLOW_TEST_DATABASE`/`ALLOW_RELEASE_TESTS` and a distinct development reference. The disposable test role needs DDL/function/trigger and SET `deadlock_timeout` privileges (the recorded run used a new temporary cluster administrator). Retain real commands/counts/failures/skips. Earlier source equivalence is not post-main verification.
- [ ] After required checks pass, retain an immutable release tag/SHA. Proposed `sprint-1` only if unused; never move an existing tag.
- [ ] Close #25 only after its actual release criteria are complete. GitHub automatic closure on merge is not proof of post-main verification/tagging.

DOD-12/G-07 and final Deliverable 1 PDF/contribution/report evidence belong to **Issue #26**; they do not add an Issue #25 closure prerequisite. Actual contributions must be confirmed, not invented.

No G-04 human acceptance, #40 approval, main integration, post-main passing results, release tag or final PDF completion is claimed by this description.
