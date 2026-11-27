# F-10 Private Teaching Improvement Notes

Deliverable 2 contract v0.1, 27 November 2026. Proposed for teammate review. FR-14, BR-01/02/13/20–22 and NFR-01/06/07/09.

## Design and workflow

- In the Closed owner results view show a private note form when results are accessible. An identified survey follows the existing Closed owner result policy. Anonymous requires at least one releasable quantitative question from F-06. GET /api/surveys/:id/note returns note or null for an eligible owner. POST creates an initial Planned note. PATCH updates both fields and optional Planned/Applied status with expectedRevision. Text fields issueSummary and plannedImprovement are trimmed and measured in Unicode code points, 1–2,000 each. Reject NUL/unpaired surrogates and unknown fields.
- A single TeachingImprovementNote row per survey stores text, status, revision, createdAt, updatedAt and nullable appliedAt. Insert enforces the unique survey key atomically. Patch uses a revision predicate and returns 409 on stale version. Applying sets appliedAt on transition, editing an already-Applied note retains it, and switching back to Planned clears it. The survey/result rows are read-only in either note operation.
- Use Closed owned scope and result authorization on every operation. Guest 401, student 403, other owner 404, wrong state 409 and invalid field 422. Keep notes out of student responses, CSV, history and analytics. Owner explicitly types plain-text interpretation and action; no automated feedback copying, sharing, audited workflow or notifications.

| AC | Planned test and level | Preconditions and input | Expected result |
| --- | --- | --- | --- |
| AC-F10-01 FR-14 BR-20 | TEST-F10-I01 API/DB, E01 UI | Owned Closed survey with permitted results; create and reload. | One Planned note persists with exact trimmed fields, revision 1, correct timestamps. |
| AC-F10-02 BR-01/02/20 | TEST-F10-I02 API/DB | Guest, student, foreign owner, Published survey and fully suppressed anonymous survey. | Scoped denial and unchanged rows. CSV and analytics omit private content. |
| AC-F10-03 BR-21 | TEST-F10-U01 unit, I03 API/DB | Fields at 0/1/2,000/2,001, malformed Unicode and invalid status; apply then return to Planned. | Exact limits and expected state/time changes, no silent truncation or invalid write. |
| AC-F10-04 BR-22 NFR-09 | TEST-F10-I04 API/DB | Concurrent creates and patches with same revision. | One create and one successful update per revision, 409 for stale attempt, and original survey/results unchanged. |

**Done when** note storage constraints and access paths are reviewed, negative/concurrency tests use the real database, and browser evidence shows persisted private authoring with release version. No acceptance is claimed while work is planned.
