# LECTRA — Requirements Traceability

Version: 0.3 (2026-11-06). Status: consolidated planned coverage, not execution evidence.
Related issue: [#2](https://github.com/Maibokdaimhai/LECTRA/issues/2).

Requirements are defined in [SRS](srs.md); features/responsibilities in [inventory](features.md). Verification descriptions below are plans. Actual AC/test IDs, files, commands, versions and results will be linked when contracts and implementation exist. All current execution statuses are **Not run**.

| Requirement | Feature / responsibility | Establish / verify | Planned verification |
| --- | --- | --- | --- |
| FR-01 | F-01 | S1 | Valid/invalid login, current identity, session expiry and logout-replay API tests; login/logout E2E. |
| FR-02 | F-02, F-03, F-04 | S1 | Owned Course/Section/Lecture selectors/current-work lists and same-Course/different-owner rejection; historical search stays F-09/S3. |
| FR-03 | F-03 | S1 | Create/edit valid Draft, invalid prompt/type/count, persisted retrieval, authoring E2E. |
| FR-04 | F-03 | S1 | Publish/close success, invalid transitions, persisted state, cross-owner rejection. |
| FR-05 | F-04 | S1 | Real DB submission/readback, confirmation E2E and invalid-answer rollback. |
| FR-06 | F-04, F-06 | S1 identified; S2 anonymous | Own answers/status across logout/login; cross-student rejection; anonymous status without answer link. |
| FR-07 | F-05, F-06 | S1; extend S2 | Frozen scale readback, correct quantitative denominators, identified text after Closed; no anonymous raw text through any owner projection. |
| FR-08 | F-06, SYS-03 | S2 | Explicit collection-policy enforcement, raw-text prohibition, question-level/sparse privacy, identity/answer separation and truthful disclosure. |
| FR-09 | F-07 | S2 | Single-choice 1/2/6/7-option boundaries, option ownership, new-Draft copy isolation, duplicate target lecture and subset eligibility. |
| FR-10 | F-08 | S2 | CSV contents/escaping, closed-owner access, threshold and omission of raw/identity fields. |
| FR-11 | F-09 | S3; progress by 29 Nov | Reused context/list views with history filters, compatible per-metric Course/own-instructor summaries, correct answer weighting and no hidden-question input. |
| FR-12 | F-02, SYS-01 | S1; Lab 5; extend S2–3 | Fresh migrate/seed reproduction, same-Course cross-owner fixtures, safe accounts, versioned starter seed and note fixtures. |
| FR-13 | F-07, SYS-01 | S2 | Preview/copy starter, four-category contents, customize copied definitions, old/new source versions, unavailable version and cross-owner target rejection. |
| FR-14 | F-10, SYS-03 | S3; progress by 29 Nov | Private issue/action/status CRUD subset, essential timestamps, unique create/revision conflict and access guards; no history/reflection/reversal workflow. |
| BR-01 | F-01, SYS-03 | S1 onward | Unauthenticated calls, client identity/role spoofing, authenticated server identity and safe errors. |
| BR-02 | F-01–10, SYS-03 | S1; extend S2–3 | Student-management, owner-owner, student-student, same-Course/different-Section and private-note access matrix. |
| BR-03 | F-02–04, F-06–07 | S1; subset S2 | Snapshot membership, later member changes and ineligible submission rejection. |
| BR-04 | F-02–03 | S1 | State-transition matrix and Draft non-disclosure. |
| BR-05 | F-03–04, F-07 | S1; single-choice S2 | Draft/Closed rejection, 0/1/10/11-question publication boundaries, text-only Draft and empty eligibility rejection. |
| BR-06 | F-04, F-06 | S1; anonymous S2 | Sequential and concurrent duplicate requests: exactly one committed participation/answer bundle. |
| BR-07 | F-03–04, F-07 | S1; choices S2 | Required/type/rating and Unicode count boundaries, ten-answer cap, UTF-8 and surrogate-escaped JSON/body limits, forged IDs and empty submission. Detailed F-04 contract in Issue #5. |
| BR-08 | F-04, F-06 | S1; anonymous S2 | Invalid item and forced transaction failure leave no partial participation/answers. |
| BR-09 | F-03, F-06–07 | S1; extend S2 | Post-publication structure/mode/eligibility mutation rejected, including direct API calls. |
| BR-10 | F-03–04, F-06 | S1; anonymous S2 | No submit-edit/resubmit or published hard-delete route; Draft deletion permitted only to owner. |
| BR-11 | F-03–04 | S1 | Deterministic real-DB lock-order tests for close-before-submit and submit-before-close. |
| BR-12 | F-05, F-08–09 | S1; extend S2–3 | Optional omissions, null mean, 1–5 distribution, per-question denominators and display rounding. |
| BR-13 | F-05–06, F-08–10 | S1; anonymous S2; notes/trends S3 | Question answered count 4/5 despite total 5/10, optional/sparse responses, nonzero bins 2/3, whole-question suppression, no anonymous text and no complementary API/UI/CSV/analytics leaks. |
| BR-14 | F-03–06, SYS-03 | S1; anonymous S2 | Identified disclosure/own answer access; anonymous disabled before accepted contract; correct mode labels. |
| BR-15 | F-06, SYS-03 | S2 | Schema/log/API/export checks for direct and metadata-based joins under the declared threat boundary. |
| BR-16 | F-05–09 | S1 identified text; S2 privacy/export | Identified comments omit identity; anonymous text absent at any count on every owner surface; suppressed question stats/answered counts absent from CSV/analytics. |
| BR-17 | F-07, SYS-01 | S2 | Exact template version / source Draft revision, concurrent edit/retirement conflict, no mixed snapshot, atomic new IDs and no copied answers/eligibility/notes. |
| BR-18 | F-07, F-09 | S2 provenance; S3 comparison | Same metric version accepted; edited prompt/anchors/type clears metric; matching title/category alone cannot join a trend. |
| BR-19 | F-09, SYS-03 | S3 | Owner/mode/metric scope and per-question release before aggregation, answer-weighted sum/count with different lecture sizes, observation versus unique-student labels and no hidden input. |
| BR-20 | F-10, SYS-03 | S3 | Reject unowned/open survey; anonymous needs at least one releasable question; unique private note and no student/CSV/analytics leakage. |
| BR-21 | F-10 | S3 | Issue/action 0/1/2,000/2,001-code-point limits, two valid statuses, essential timestamp behavior; no mandatory reflection or reversal reason. |
| BR-22 | F-10, SYS-01 | S3 | Stale revision conflict, atomic field/status/timestamp/revision update, unchanged survey/results; no status-history model. |
| BR-23 | F-02–03, F-07 | S1; copying S2 | Survey/lecture/Section owner consistency, unique lecture survey across concurrent create/copy, no starter/note dependency in Sprint 1. |
| NFR-01 | F-01–10, SYS-03 | S1; regression S2–3 | Backend access suite, password-storage inspection and safe-error checks, including source-copy and note routes as introduced. |
| NFR-02 | F-03–04, SYS-01, SYS-04 | S1; redeploy Lab 5 | Application restart retrieval and concurrency tests; cloud redeployment durability. |
| NFR-03 | SYS-01–02 | S1; Lab 5 | Teammate fresh-checkout setup/build/test; container and pipeline reproduction later. |
| NFR-04 | F-04–05, F-09, SYS-04 | S3 | Recorded load run against specified dataset/concurrency/hardware. |
| NFR-05 | All features, SYS-02, SYS-04 | S1 onward | AC-to-planned/actual-test audit and meaningful unit/API/DB/E2E results. |
| NFR-06 | F-06, F-08–10, SYS-03 | S2; regression S3 | Raw-text non-exposure, separately counted per-question privacy, sparse/differencing cases, storage separation and every result-consumer projection. |
| NFR-07 | F-01–10, SYS-04 | Basic S1; extend S2; final S3 | Selected keyboard/viewport E2E plus explicit manual checks, extending to starter and note screens when implemented. |
| NFR-08 | SYS-02, SYS-04 | S1; CI/CD Lab 5 onward | Issue/PR/review history, release commit and test/build evidence audit. |
| NFR-09 | F-07, F-10, SYS-01, SYS-04 | S2 template; S3 note | Source revision/copy mutation cannot change stored survey/answer snapshots; note uniqueness/version conflicts and unchanged underlying results. |

## Coverage gaps and change status

Every baseline FR/BR/NFR currently has a planned responsibility and verification allocation. This is planned coverage only. F-01 has draft AC/STS IDs under #10 as mapped below; the other Sprint 1 feature contracts remain to be written. No executed application tests/results, teammate contract approval or accepted Sprint 1 release is claimed.

Unresolved gates are in [decisions](decisions.md). Common Part E coordination now has draft [register](sprints/sprint-1/README.md), [conventions](sprints/sprint-1/shared-contract.md) and [Product DoD](sprints/sprint-1/product-dod.md), supporting NFR-03/05/07/08 and SYS-01-04. They add no FR/BR/NFR IDs and do not close #5 or prove human adoption. No approved requirement removal or completed test is claimed. After contracts are written, extend this matrix with AC/test IDs; after execution, add actual file/test name, command or run, tested commit, result and evidence location.

## F-01 draft contract trace (Issue #10)

All rows are F-01 / Sprint 1. The [feature contract](sprints/sprint-1/f-01-authentication.md) contains the full stable 20-AC-to-test map; the [STS](sprints/sprint-1/f-01-authentication-sts.md) defines 47 planned cases with levels, inputs/preconditions, action and expected outcome. Shared Product DoD and teammate acceptance remain #5 gates. Actual test file/name, tested implementation SHA/run, observed result and evidence location for every row are **Not run / not available**; these draft specifications do not constitute Part F.

| Requirement / responsibility | Draft AC links | Planned verification / boundary |
| --- | --- | --- |
| FR-01 / SYS-01 | AC-F01-01, 03-09, 16-17, 19 | Bootstrap/login/me/logout, hash/session persistence, absolute expiry, restart/replay and UI session-loss cases: TEST-F01-I01, I03-I09, I16-I21, I24, I26-I28, E01-E03, E05; unit policy cases. |
| BR-01 / SYS-03 | AC-F01-02, 06-12 | Strict input/identity trust, CSRF/Origin, session/role/scoped guard cases: TEST-F01-U01-U04, U07, I06-I17, I25. |
| BR-02 / SYS-03 | AC-F01-08, 12 | TEST-F01-U04, I09-I12, I15 establish trusted identity/guard behavior; H01-H04 require real F-02-F-05 routes/DB under dependent work and #22. No full ownership/cross-response coverage is claimed from a harness. |
| NFR-01 / SYS-03 | AC-F01-05, 08-14, 18-19 | Credential/guard/failure/cache/log/throttle checks in TEST-F01-U03-U06, I02, I09-I19, I21-I26, E02-E05 and actual domain H01-H04. |
| NFR-03 / SYS-01 | AC-F01-11, 17 | TEST-F01-I02, I20, I24-I25, M02; #15/#16 must provide actual runtime/lockfile/schema/setup evidence before implementation readiness is accepted. |
| NFR-05 / SYS-02 | AC-F01-20; all behavior AC | All AC map to STS; TEST-F01-M03 audits actual unit/API-DB/selected UI results and real TDD history later. Existing planned counts are not runner results. |
| NFR-07 / SYS-04 | AC-F01-15-16 | TEST-F01-E01-E05 and M01; actual keyboard/viewport/state checks at 360px/1280px, with supplementary SDS reflow/zoom review. |
| NFR-08 / SYS-02 | AC-F01-20 | TEST-F01-M03: actual preimplementation contract/test-design version, substantive human review/integration and release-SHA-linked verification under #25/#26. |

## Instructor-theme coverage cross-check

| Instructor outcome | LECTRA requirements / allocation | Limit of current evidence |
| --- | --- | --- |
| Real full-stack persistence and meaningful domain workflow | FR-01–07, FR-12; F-01–05/SYS-01 in S1. | Planned architecture/requirements; no running application. |
| Owner and respondent permissions, ownership and cross-response rejection | BR-01–02, BR-23, NFR-01; S1 foundation, regress all additions. | Matrix and planned negative cases, no API result yet. |
| Define surveys, control eligibility and validation | FR-02–05, BR-03–09; S1; richer questions/subsets FR-09/S2. | Contracts/AC/STS still needed before coding. |
| Reject repeat and unpublished/closed responses | BR-04–08, BR-11, NFR-02; S1 real DB concurrency. | Transaction design; no executed concurrency test. |
| Identified and documented/tested anonymous modes | FR-08, BR-14–15, NFR-06; identified S1, anonymous S2. | Anonymous detailed privacy contract gate remains open. |
| Aggregate results, analysis and export | FR-07/S1, FR-10/S2, FR-11/S3, BR-12–13/16/18–19. | Planned, not working analysis or exported output. |
| Contracts, TDD, automated verification and reviewed releases | NFR-05/08, SYS-02/04; every sprint. | This PR is planning documentation; not Part E/F completion. |

Starter Questionnaire (FR-13) and Teaching Improvement Notes (FR-14) are product extensions requested for consideration, not instructor theme mandates. They add no Sprint 1 implementation requirement.

## Extending this matrix without inventing history

For each contract AC, add rows with `Requirement → Feature → Sprint → AC ID → planned test ID/level → actual test file/name → tested commit/run → result → evidence location`. Use `Not specified` before the contract exists, `Not run` before execution, and actual PASS/FAIL/SKIP only after observing output. Link manual checks separately from automated tests. Maintain failed/skipped cases rather than removing them from traceability.

Preserve stable IDs when wording changes; record meaningful changes in the decision log and update all dependent contracts/tests. Append IDs for new requirements. Do not reuse a retired ID for a different rule or overwrite the assessed release reference with a later commit.

## Review recommendation trace, not new requirement IDs

P10 is retained in F-07/FR-13/BR-17; P05 in F-07/F-09/FR-11/BR-18–19; P14 is simplified in F-10/FR-14/BR-20–22 with sharing deferred. P15 is incorporated as exploratory SYS-04/S3 usability evaluation supporting FR-07/FR-14 user goals and NFR-07 context, not a new measured NFR or mandatory Lab 6 replacement. Exact dispositions/value/trade-offs are in the [review register](baseline-review.md); the separate Initial Review REV-08 concerns explicit pre-contract decision records. Attribution uses the owner's descriptions of the teammate's reports; direct full-report verification remains OPEN-11. No test, session or original-report access is implied by these mappings.
