# LECTRA — Requirements Traceability

Version: 0.1 (2026-11-06). Status: planned coverage, not execution evidence.
Related issue: [#2](https://github.com/Maibokdaimhai/LECTRA/issues/2).

Requirements are defined in [SRS](srs.md); features/responsibilities in [inventory](features.md). Verification descriptions below are plans. Actual AC/test IDs, files, commands, versions and results will be linked when contracts and implementation exist. All current execution statuses are **Not run**.

| Requirement | Feature / responsibility | Establish / verify | Planned verification |
| --- | --- | --- | --- |
| FR-01 | F-01 | S1 | Valid/invalid login, current identity, session expiry and logout-replay API tests; login/logout E2E. |
| FR-02 | F-02, F-03, F-04 | S1 | Owned context discovery, eligible lists, wrong-room/owner API tests. |
| FR-03 | F-03 | S1 | Create/edit valid Draft, invalid prompt/type/count, persisted retrieval, authoring E2E. |
| FR-04 | F-03 | S1 | Publish/close success, invalid transitions, persisted state, cross-owner rejection. |
| FR-05 | F-04 | S1 | Real DB submission/readback, confirmation E2E and invalid-answer rollback. |
| FR-06 | F-04, F-06 | S1 identified; S2 anonymous | Own answers/status across logout/login; cross-student rejection; anonymous status without answer link. |
| FR-07 | F-05 | S1; extend S2 | Mean/distribution/denominator fixtures, count while Published, text after Closed, owner API restrictions. |
| FR-08 | F-06, SYS-03 | S2 | Mode immutability, schema/API/log/export linkability review and privacy tests; anonymous critical journey. |
| FR-09 | F-07 | S2 | Single-choice option validation, new-Draft copy isolation and subset eligibility tests. |
| FR-10 | F-08 | S2 | CSV contents/escaping, closed-owner access, threshold and omission of raw/identity fields. |
| FR-11 | F-09 | S3; progress by 29 Nov | Owned filters, no-data history and rejection/exclusion of incomparable question series. |
| FR-12 | F-02, SYS-01 | S1; Lab 5 | Fresh migration/seed reproduction, safe accounts, no real secrets. |
| BR-01 | F-01, SYS-03 | S1 onward | Unauthenticated calls, client identity/role spoofing, authenticated server identity and safe errors. |
| BR-02 | F-01–05, SYS-03 | S1; extend S2–3 | Student-management, owner-owner and student-student access matrix at API/DB integration level. |
| BR-03 | F-02–04, F-06–07 | S1; subset S2 | Snapshot membership, later member changes and ineligible submission rejection. |
| BR-04 | F-02–03 | S1 | State-transition matrix and Draft non-disclosure. |
| BR-05 | F-03–04 | S1 | Draft/Closed rejection and publication limits at 0/1/10/11 questions with empty eligibility. |
| BR-06 | F-04, F-06 | S1; anonymous S2 | Sequential and concurrent duplicate requests: exactly one committed participation/answer bundle. |
| BR-07 | F-03–04, F-07 | S1; choices S2 | Missing/whitespace required text, 0/1/5/6/noninteger ratings, text length limits, forged question IDs. |
| BR-08 | F-04, F-06 | S1; anonymous S2 | Invalid item and forced transaction failure leave no partial participation/answers. |
| BR-09 | F-03, F-06–07 | S1; extend S2 | Post-publication structure/mode/eligibility mutation rejected, including direct API calls. |
| BR-10 | F-03–04, F-06 | S1; anonymous S2 | No submit-edit/resubmit or published hard-delete route; Draft deletion permitted only to owner. |
| BR-11 | F-03–04 | S1 | Deterministic real-DB lock-order tests for close-before-submit and submit-before-close. |
| BR-12 | F-05, F-08–09 | S1; extend S2–3 | Optional omissions, null mean, 1–5 distribution, per-question denominators and display rounding. |
| BR-13 | F-05–06, F-08–09 | S1; anonymous S2 | Published count-only; Closed results; anonymous 4/5-response threshold at API/UI/export. |
| BR-14 | F-03–06, SYS-03 | S1; anonymous S2 | Identified disclosure/own answer access; anonymous disabled before accepted contract; correct mode labels. |
| BR-15 | F-06, SYS-03 | S2 | Schema/log/API/export checks for direct and metadata-based joins under the declared threat boundary. |
| BR-16 | F-05, F-07–08 | S1 text policy; S2 export/choices | Owner text view has no identity; CSV omits raw/text data; single-choice counts without numeric mean. |
| NFR-01 | F-01–05, SYS-03 | S1; regression S2–3 | Backend access suite, password-storage inspection and safe-error checks. |
| NFR-02 | F-03–04, SYS-01, SYS-04 | S1; redeploy Lab 5 | Application restart retrieval and concurrency tests; cloud redeployment durability. |
| NFR-03 | SYS-01–02 | S1; Lab 5 | Teammate fresh-checkout setup/build/test; container and pipeline reproduction later. |
| NFR-04 | F-04–05, F-09, SYS-04 | S3 | Recorded load run against specified dataset/concurrency/hardware. |
| NFR-05 | All features, SYS-02, SYS-04 | S1 onward | AC-to-planned/actual-test audit and meaningful unit/API/DB/E2E results. |
| NFR-06 | F-06, F-08, SYS-03 | S2; regression S3 | Privacy design review, threshold cases and identity/answer separation tests. |
| NFR-07 | F-01–05, F-09, SYS-04 | Basic S1; final S3 | Selected keyboard/viewport E2E plus explicit manual checks. |
| NFR-08 | SYS-02, SYS-04 | S1; CI/CD Lab 5 onward | Issue/PR/review history, release commit and test/build evidence audit. |

## Coverage gaps and change status

Every baseline FR/BR/NFR currently has a planned responsibility and verification allocation. This is planned coverage only. Sprint 1 feature contracts, stable AC/test IDs, actual tests/results, teammate review and accepted release evidence do not yet exist and must not be marked complete.

Unresolved gates are in [decisions](decisions.md). No approved requirement removal or completed test is claimed. After contracts are written, extend this matrix with AC/test IDs; after execution, add actual file/test name, command or run, tested commit, result and evidence location.
