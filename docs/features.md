# LECTRA — Feature Inventory

Version: 0.1 (2026-11-06). Status: working draft. Related issue: [#2](https://github.com/Maibokdaimhai/LECTRA/issues/2).
Source requirements: [SRS](srs.md). All features are planned, not implemented or verified.

| ID | Feature / outcome | Requirement links | Dependencies | Sprint |
| --- | --- | --- | --- | --- |
| F-01 | Authentication and access foundation: login/logout/me, database-backed sessions, backend role/record guards. | FR-01; BR-01–02; NFR-01 | Seeded identity and database setup under SYS-01 | 1 |
| F-02 | Seeded classroom/lecture context and discovery: reproducible owners, memberships, lectures and eligible survey lists. | FR-02, FR-12; BR-03–04 | F-01, SYS-01 | 1 |
| F-03 | Survey authoring/lifecycle: rating/text Draft creation/edit/delete, validation, publish with eligibility snapshot, manual close and structural locking. | FR-03–04; BR-02–05, BR-07, BR-09–11, BR-14 | F-01, F-02 | 1 |
| F-04 | Identified response submission and retrieval: atomic validated submission, duplicate prevention, confirmation/status and own-answer retrieval. | FR-05–06; BR-01–08, BR-10–11, BR-14 | F-01, F-02, F-03 | 1 |
| F-05 | Owner results: response count, rating mean/distribution, no-data states and text feedback after closure without identity labels. | FR-07; BR-02, BR-12–14, BR-16 | F-03, F-04 | 1 |
| F-06 | Anonymous response mode: identity/answer separation, status-only self-service, truthful disclosure and privacy-threshold enforcement. | FR-08; FR-06 (anonymous); BR-03, BR-06, BR-08, BR-13–15; NFR-06 | F-01–05 and accepted privacy contract | 2 |
| F-07 | Bounded survey expansion: single-choice questions, duplicate-to-Draft for another lecture and eligible-member subset before publication. | FR-09; BR-03, BR-07, BR-09, BR-16 | F-02–05; coexistence tests with F-06 | 2 |
| F-08 | Authorized aggregate CSV export following result visibility and anonymous suppression rules. | FR-10; BR-02, BR-12–13, BR-16 | F-05, F-06, F-07 | 2 |
| F-09 | Owner lecture history/filtering and trends across explicitly compatible rating questions/scales. | FR-11; BR-02, BR-12–13 | F-05–08; explicit question-comparability contract | 3; working progress by 29 Nov |

## Named system responsibilities

These are engineering responsibilities, not extra user-facing features or a mandatory feature-count quota.

| ID | Responsibility | Requirements | Establish / verify |
| --- | --- | --- | --- |
| SYS-01 | Database migrations, reproducible synthetic seed, configuration and setup/build instructions. | FR-12; NFR-02–03 | Sprint 1; Docker/redeployment in Lab 5; regression later. |
| SYS-02 | Release engineering: contracts before implementation, Issues/board, feature branches from staging, teammate reviews, integrated release and evidence tied to commit. | NFR-05, NFR-08 | Sprint 1; CI quality gates and GCP pipeline in Lab 5; maintained afterward. |
| SYS-03 | Privacy/security across schema, sessions, APIs, UI, logging, exports and failure paths. | BR-01–02, BR-13–16; NFR-01, NFR-06 | Basic access/disclosure in Sprint 1; anonymous verification in Sprint 2; regression/hardening in Sprint 3. |
| SYS-04 | Integration, usable UI states, performance verification, cross-team UAT, approved maintenance and regression/defect closure. | NFR-02, NFR-04–05, NFR-07–08 | Basic integration/UI in Sprint 1; Labs 6–7 during continued development; final verification Sprint 3. |

## Scope control

Course-administration UI, staff delegation, multiple-choice with multiple selections, scheduling, PDF data export, cross-instructor comparisons and AI feedback insights are excluded. Any addition requires a recorded scope/dependency/test impact decision. Anonymous and aggregate export are baseline work, not optional stretch goals.

Detailed AC and test IDs will be assigned in Issue #5 before each Sprint 1 feature is implemented. This inventory does not claim that those contracts or tests already exist.
