# Actual workflow, contributions and release history

Owner explicitly confirmed account/name mapping on 2026-11-12.

## Completed Issue / PR samples

### Issue #22 / PR #37
Feature/contracts: F-01–F-05 cross-feature verification / accepted contracts. Actual author: Maibokdaimhai; branch test/22-sprint1-api-integration → staging; reviewed source b024596bd09daea7099acc3607d4be25cdc0dd84; staging merge 4ff4562a8cf1a58fa5c6ae1d958b4ab8c0b2e18f at 2026-11-10T13:28:53Z. This merge is an ancestor of assessed main af2e1030984bcc816081b25b29c9de52a80efe30; git ancestry verified.

**Actual review:** R1NNE0 / CHANGES_REQUESTED / 2026-11-09T20:24:45Z / source 2726f9a595067ea09f21626894895f059782e3be
**Request Changes — One Minor Evidence Correction**

No actionable Blocker/Major implementation findings were identified.

Independent verification passed:
- 32 feature/API/PostgreSQL tests
- 37 unit tests
- 2 API liveness tests

Coverage inventory checks confirmed 113 unique AC records, 183 unique STS records, valid references and bidirectional mappings.

### Minor — Unsupported Evidence Mapping

**File:** `docs/sprints/sprint-1/issue-22-coverage.json`  
**Location:** `TEST-F02-I10` (line 2384)

The cited INT22-03 scenario does not perform the membership changes or subsequent discovery checks required by this test case. INT22-02 verifies detail/submission eligibility, not discovery behavior.

Please remove the unsupported INT22-03 mapping and update AC-F02-08's selected evidence and the coverage summary totals.

Alternatively, add explicit integration assertions that remove an eligible member, add an ineligible member, and verify the resulting discovery behavior.

Please retain the Partial disposition only when supported by actual test evidence.

All other reviewed implementation and verification findings are satisfactory.

**Recommendation: Request changes for this Minor evidence correction only.**

**Actual review:** R1NNE0 / APPROVED / 2026-11-10T13:28:24Z / source b024596bd09daea7099acc3607d4be25cdc0dd84
**APPROVE** — The previous Minor evidence finding is fully resolved in `b024596`.

Verified that:
- The unsupported INT22-03 mapping was removed from TEST-F02-I10.
- TEST-F02-I10 is explicitly marked Not demonstrated.
- AC-F02-08 has no unsupported selected evidence and remains pending disposition.
- Coverage totals are consistent: 113 AC / 183 STS, with 104 Partial and 46 Not demonstrated.
- All IDs and bidirectional references remain valid.

The correction is documentation-only. Application, test and configuration files remain unchanged from the independently tested source commit `40d8ea1`.

No new actionable findings identified.

**Ready for approval and merge.**

### Issue #23 / PR #38
Feature/contracts: F-01/F-03/F-04/F-05 browser and recovery integration. Actual author: R1NNE0; branch test/23-sprint1-browser-journeys → staging; reviewed source 4527ba5b26973fd14d42e3d1415c07632510315f; staging merge 60736fb0f4f3e900a68179ed71d11668861445f9 at 2026-11-10T06:07:57Z. This merge is an ancestor of assessed main af2e1030984bcc816081b25b29c9de52a80efe30; git ancestry verified.

**Actual review:** Maibokdaimhai / APPROVED / 2026-11-10T03:33:56Z / source 4527ba5b26973fd14d42e3d1415c07632510315f
**Recommendation: Approve — PR #38**

AI-assisted review of commit `4527ba5b26973fd14d42e3d1415c07632510315f`.

No actionable findings were identified within the reviewed scope.

The DEF-B23-01 fix correctly refreshes authoritative Survey state for `409 INVALID_STATE`, reconciles submission status, preserves uncertainty when recovery fails, and removes submission controls after closure without automatically replaying the POST. Other 409 responses retain their existing recovery behavior.

Independently verified on the exact PR head:

- Typecheck and production build: passed.
- Unit tests: 37 passed.
- API liveness: 2 passed.
- Real browser/API/PostgreSQL journeys: 14 passed.
- Isolated mocked-browser recovery: 38 passed.
- Workspace smoke: 4 passed.

**95 tests passed**, with no failures or skips. The real-browser tests used a new isolated PostgreSQL database.

Also checked scenario/AC/STS references, screenshot hashes, and source hashes accounting for Windows LF/CRLF differences. The evidence appropriately distinguishes real integration tests, mocked recovery, historical failures and partial STS coverage.

This review does not certify complete Product DoD, release readiness or the final PDF. Those remain separate acceptance gates.

## Thanawat Suntarawattana / Maibokdaimhai
Product baseline/shared contracts/workflow and F-04/tooling; integrated app PR #36, API verification #37, auth correction #42, final session correction #45; substantive reviews of schema/browser/UI work, including #38/#43. AI assistance disclosed.
Recorded PR authors/review metadata and source history; final #45 also contains R1NNE0 correction, not attributed exclusively to the initial author.

## Songwit Rueangsawat / R1NNE0
F-02/F-03/F-05 contract work, database schema/seed PR #35, browser/failure recovery #38, UI accessibility #43, PostgreSQL connection-loss #44 and logout CSRF rotation c125a60 in #45; substantive counterpart reviews including release #40.
Recorded actual commits/PR authors/reviews; #40 approval explicitly accepts bounded G-04 limitations.

## Contribution and AI boundary
Table identifies observed artifact authorship and substantive reviews, not hours/line counts or proof of unaided authorship/comprehension. Pair sessions/hours were not reported and are not invented.
Codex assisted planning, implementation, test execution, reviews and report assembly under the owners instructions. Actual GitHub human reviews are recorded separately; AI review is not teammate approval. Both students remain responsible for explaining and validating submitted work.

## Board at released increment
{'Backlog': 1, 'Specified': 0, 'Started': 1, 'PR Review': 0, 'Fixing': 0, 'Done': 23}
#8 remains overall delivery tracker; #26 remains report assembly/review. Kanban still lists #26 in Backlog at capture; report work is underway. This is the observed release-time board, not a fabricated all-Done delivery/submission state.

## Genuine TDD and preimplementation sequence

fc64e2cc16557d77d67ef278d56e05c86c2621fc | 2026-11-06T22:33:30+07:00 | docs: define shared Sprint 1 contracts and F-01 specification
F-01 shared contract and STS recorded before auth implementation

029cf011aa19c262f125017b91ca8e1987f7381e | 2026-11-07T03:14:05+07:00 | docs: define F-03 survey authoring contract and STS
F-03 contract/test design before implementation

fa944d9760b8ddf055836e11085e89dc367e8feb | 2026-11-09T01:02:00+07:00 | feat(auth): persist sessions and capture failing feedback API journeys
Recorded feature RED: 4 failed / 5 passed before domain routes; missing-route observations, not proof of all dependent business rules

4f9e5933835a7e11433ae5ae87ad320e8fa8d968 | 2026-11-09T01:13:35+07:00 | feat(feedback): implement identified workflows and capture exact expiry regression
Domain implementation followed; later assessed-main suite verifies current behavior

6d40e0c3e2ceea5aafddfa8e1e42316545986f9e | 2026-11-11T23:56:54+07:00 | test(auth): reproduce usable session after failed exact-expiry save
Permanent failed-save regression recorded before atomic persistence correction; real focused RED

cccb1c02973e3cee47fd10a63f6769b6523e9c6c | 2026-11-11T23:59:00+07:00 | fix(auth): persist sessions and absolute expiry atomically
Atomic persistence correction; source-bound GREEN record retained

5a69beb6919e80239ece53226c88c224911a8d4b | 2026-11-12T16:38:05+07:00 | fix: handle PostgreSQL connection loss after commit
Connection-loss correction retains two explicit failing-before regressions and passing-after record

c125a6078b2337f29f0a1c3fcbcecfc519cd02f4 | 2026-11-12T21:30:46+07:00 | fix(auth): recover logout after CSRF cookie rotation
Logout native-cookie regression: actual pre-fix 403 at both widths, corrected source passes; actual post-main 2 passes

