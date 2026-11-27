# F-06 Anonymous feedback

Deliverable 2 contract v0.1, 27 November 2026. Proposed for teammate review. F-06 is allocated to Sprint 2. The identified release at efafce7 remains the implementation baseline.

**Requirements.** FR-06–08 and BR-01–03, 05–11, 13–16 and NFR-01, 02, 06, 07. Preserve identified own-answer retrieval, eligibility, single submission, closed-result semantics and Lab 7 limits.

## Design and workflow

- A survey owner sets the Draft mode with the existing revision-checked definition update. Published and Closed definitions remain frozen. Show the mode in both roles before response entry. The anonymous notice explains account-based eligibility and once-only participation, status-only readback and exposure risks from infrastructure observation or external information.
- Proposed decision for OPEN-04: do not accept or store anonymous written feedback. Validate the full Draft before publishing and reject a TEXT question in anonymous mode. An owner can remove text or select identified mode. Reject a forged text submission before writing. Existing identified drafts and surveys keep their data and UI.
- Within the existing survey-locked submit transaction, insert the eligibility-linked participation and exactly one answer bundle. For anonymous mode the bundle identifier is independently random, has no student, session, participation identifier or precise submission timestamp, and is not returned to the student. The database retains a unique student/survey participation key. Reads never correlate participation and bundles. Keep identity-vs-mode constraints at the write boundary and in SQL. Inspect storage and application logs as part of verification. Infrastructure, backups and timing remain outside the stated anonymity guarantee.
- The anonymous own-submission endpoint returns the submission state only. Published owner results return the survey-level response count. After closure, compute each quantitative question independently. Release a question only when at least five valid answers are present and every nonzero displayed bin has at least three answers. A suppressed question returns its definition plus suppression status, with no numeric fields. CSV and trend surfaces reuse this guarded projection. No anonymous text appears on any owner-facing path.
- The schema migration is additive for existing identified records. Owner/respondent role checks and authorization for scope occur before a result can be returned. Maintain safe 404 for out-of-scope records, 409 for stale state or duplicates and 422 for invalid definitions or answers. Failed and duplicate writes do not create extra rows.

## Acceptance and STS

| AC and requirement | Planned test and level | Preconditions and input | Expected result |
| --- | --- | --- | --- |
| AC-F06-01 FR-08 BR-09/14 | TEST-F06-I01 API/DB, E01 UI | Owner modifies owned Draft, then publishes and retries mode change. | Draft mode persists and disclose mode before answering. Later changes conflict. |
| AC-F06-02 FR-08 BR-05/15 | TEST-F06-I02 API/DB | Draft anonymous with TEXT, and forged anonymous text answer. | Publication and submission reject the invalid records. No text or partial response is persisted. |
| AC-F06-03 FR-05/06 BR-06/08/11/15 | TEST-F06-I03 API/DB | Two simultaneous submissions from an eligible student and a later own-status read. | Exactly one participation and one unlinkable bundle. Status contains no answers, IDs that join to answers, or precise receipt metadata. |
| AC-F06-04 FR-07 BR-13/16 | TEST-F06-U01 unit, I04 API/DB, E02 UI | Closed survey with question counts 4 and 5, then six answers split 2/4 or 3/3. Test Published too. | With four or any nonzero bin below three, suppress the entire numeric question. Valid thresholds permit results only after closure. |
| AC-F06-05 NFR-06 BR-01/02/15 | TEST-F06-I05 API/DB, M01 inspection | Other owner, ineligible student, guest, CSV/history consumers, schema and logging review. | Scoped denials, no raw text or hidden aggregate, no public identity-to-answer join or answer payload logging. |
| AC-F06-06 BR-07/12 NFR-02 | TEST-F06-I06 API/DB | Migrate previously recorded identified answers and run identified regression. | Own saved answers, Lab 7 validation, counts and results continue to work. |

**Done when** OPEN-04 and projection policy receive recorded team review, migration is repeatable on a fresh database and safe on identified rows, AC tests run on the reviewed commit including privacy/negative tests, the teammate reviews the feature PR and the integrated release passes regression.
