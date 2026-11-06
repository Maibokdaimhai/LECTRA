# LECTRA — Requirements Traceability

Version: 0.2 (2026-11-06). Status: revised planned coverage, not execution evidence.
Related issue: [#2](https://github.com/Maibokdaimhai/LECTRA/issues/2).

Requirements are defined in [SRS](srs.md); features/responsibilities in [inventory](features.md). Verification descriptions below are plans. Actual AC/test IDs, files, commands, versions and results will be linked when contracts and implementation exist. All current execution statuses are **Not run**.

| Requirement | Feature / responsibility | Establish / verify | Planned verification |
| --- | --- | --- | --- |
| FR-01 | F-01 | S1 | Valid/invalid login, current identity, session expiry and logout-replay API tests; login/logout E2E. |
| FR-02 | F-02, F-03, F-04 | S1 | Course/Section/Lecture discovery, eligible lists and same-Course/different-owner Section access rejection. |
| FR-03 | F-03 | S1 | Create/edit valid Draft, invalid prompt/type/count, persisted retrieval, authoring E2E. |
| FR-04 | F-03 | S1 | Publish/close success, invalid transitions, persisted state, cross-owner rejection. |
| FR-05 | F-04 | S1 | Real DB submission/readback, confirmation E2E and invalid-answer rollback. |
| FR-06 | F-04, F-06 | S1 identified; S2 anonymous | Own answers/status across logout/login; cross-student rejection; anonymous status without answer link. |
| FR-07 | F-05 | S1; extend S2 | Mean/distribution/denominator fixtures, count while Published, text after Closed, owner API restrictions. |
| FR-08 | F-06, SYS-03 | S2 | Mode immutability, schema/API/log/export linkability review and privacy tests; anonymous critical journey. |
| FR-09 | F-07 | S2 | Single-choice 1/2/6/7-option boundaries, option ownership, new-Draft copy isolation, duplicate target lecture and subset eligibility. |
| FR-10 | F-08 | S2 | CSV contents/escaping, closed-owner access, threshold and omission of raw/identity fields. |
| FR-11 | F-09 | S3; progress by 29 Nov | Course/Section/date/state filters within ownership, no-data history, exact metric comparison and suppression-safe results. |
| FR-12 | F-02, SYS-01 | S1; Lab 5; extend S2–3 | Fresh migrate/seed reproduction, same-Course cross-owner fixtures, safe accounts, versioned starter seed and note fixtures. |
| FR-13 | F-07, SYS-01 | S2 | Preview/copy starter, four-category contents, customize copied definitions, old/new source versions, unavailable version and cross-owner target rejection. |
| FR-14 | F-10, SYS-03 | S3; progress by 29 Nov | Create/read/edit private note after Closed visible results; Planned/Applied transitions, unique concurrent create, stale edit and access rejection. |
| BR-01 | F-01, SYS-03 | S1 onward | Unauthenticated calls, client identity/role spoofing, authenticated server identity and safe errors. |
| BR-02 | F-01–10, SYS-03 | S1; extend S2–3 | Student-management, owner-owner, student-student, same-Course/different-Section and private-note access matrix. |
| BR-03 | F-02–04, F-06–07 | S1; subset S2 | Snapshot membership, later member changes and ineligible submission rejection. |
| BR-04 | F-02–03 | S1 | State-transition matrix and Draft non-disclosure. |
| BR-05 | F-03–04, F-07 | S1; single-choice S2 | Draft/Closed rejection, 0/1/10/11-question publication boundaries, text-only Draft and empty eligibility rejection. |
| BR-06 | F-04, F-06 | S1; anonymous S2 | Sequential and concurrent duplicate requests: exactly one committed participation/answer bundle. |
| BR-07 | F-03–04, F-07 | S1; choices S2 | Missing/whitespace required text, 0/1/5/6/noninteger ratings, Unicode length limits, forged question IDs and all-optional empty submission. |
| BR-08 | F-04, F-06 | S1; anonymous S2 | Invalid item and forced transaction failure leave no partial participation/answers. |
| BR-09 | F-03, F-06–07 | S1; extend S2 | Post-publication structure/mode/eligibility mutation rejected, including direct API calls. |
| BR-10 | F-03–04, F-06 | S1; anonymous S2 | No submit-edit/resubmit or published hard-delete route; Draft deletion permitted only to owner. |
| BR-11 | F-03–04 | S1 | Deterministic real-DB lock-order tests for close-before-submit and submit-before-close. |
| BR-12 | F-05, F-08–09 | S1; extend S2–3 | Optional omissions, null mean, 1–5 distribution, per-question denominators and display rounding. |
| BR-13 | F-05–06, F-08–10 | S1; anonymous S2; notes/trends S3 | Published count-only; Closed results; anonymous 4/5-response threshold at API/UI/export/trend/note paths. |
| BR-14 | F-03–06, SYS-03 | S1; anonymous S2 | Identified disclosure/own answer access; anonymous disabled before accepted contract; correct mode labels. |
| BR-15 | F-06, SYS-03 | S2 | Schema/log/API/export checks for direct and metadata-based joins under the declared threat boundary. |
| BR-16 | F-05, F-07–08 | S1 text policy; S2 export/choices | Owner text view has no identity; CSV omits raw/text data; single-choice counts without numeric mean. |
| BR-17 | F-07, SYS-01 | S2 | New definition IDs, atomic copy rollback, immutable source/version lineage, no copied answers/eligibility/notes, mutation isolation. |
| BR-18 | F-07, F-09 | S2 provenance; S3 comparison | Same metric version accepted; edited prompt/anchors/type clears metric; matching title/category alone cannot join a trend. |
| BR-19 | F-09, SYS-03 | S3 | Exclude another owner's, Draft/Published, hidden-threshold and incomparable surveys before computing trends; show counts and no unlabelled pooled average. |
| BR-20 | F-10, SYS-03 | S3 | Draft/Published/suppressed survey note creation denied; one private note under concurrent creates; no student/export/trend disclosure. |
| BR-21 | F-10 | S3 | Trimmed 0/1/2,000/2,001-code-point fields, invalid status, create Planned, Applied reflection requirement, return reason and repeated-status behavior. |
| BR-22 | F-10, SYS-01 | S3 | Revision conflict on concurrent edit, atomic note/status-history update, unchanged survey/results and no raw-comment logging. |
| BR-23 | F-02–03, F-07 | S1; copying S2 | Survey/lecture/Section owner consistency, unique lecture survey across concurrent create/copy, no starter/note dependency in Sprint 1. |
| NFR-01 | F-01–10, SYS-03 | S1; regression S2–3 | Backend access suite, password-storage inspection and safe-error checks, including source-copy and note routes as introduced. |
| NFR-02 | F-03–04, SYS-01, SYS-04 | S1; redeploy Lab 5 | Application restart retrieval and concurrency tests; cloud redeployment durability. |
| NFR-03 | SYS-01–02 | S1; Lab 5 | Teammate fresh-checkout setup/build/test; container and pipeline reproduction later. |
| NFR-04 | F-04–05, F-09, SYS-04 | S3 | Recorded load run against specified dataset/concurrency/hardware. |
| NFR-05 | All features, SYS-02, SYS-04 | S1 onward | AC-to-planned/actual-test audit and meaningful unit/API/DB/E2E results. |
| NFR-06 | F-06, F-08–10, SYS-03 | S2; regression S3 | Privacy design review, threshold cases, identity/answer separation and trend/note side-channel checks. |
| NFR-07 | F-01–10, SYS-04 | Basic S1; extend S2; final S3 | Selected keyboard/viewport E2E plus explicit manual checks, extending to starter and note screens when implemented. |
| NFR-08 | SYS-02, SYS-04 | S1; CI/CD Lab 5 onward | Issue/PR/review history, release commit and test/build evidence audit. |
| NFR-09 | F-07, F-10, SYS-01, SYS-04 | S2 template; S3 note | Source revision/copy mutation cannot change stored survey/answer snapshots; note uniqueness/version conflicts and unchanged underlying results. |

## Coverage gaps and change status

Every baseline FR/BR/NFR currently has a planned responsibility and verification allocation. This is planned coverage only. Sprint 1 feature contracts, stable AC/test IDs, actual tests/results, teammate review and accepted release evidence do not yet exist and must not be marked complete.

Unresolved gates are in [decisions](decisions.md). No approved requirement removal or completed test is claimed. After contracts are written, extend this matrix with AC/test IDs; after execution, add actual file/test name, command or run, tested commit, result and evidence location.

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
