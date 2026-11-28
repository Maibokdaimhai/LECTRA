# F-07 survey definition verification

28 November 2026 ICT. Implemented on top of staging merge `4eed872`. The versioned contract is in [PR #79](https://github.com/Maibokdaimhai/LECTRA/pull/79). The starter is application-provided under immutable key `lecture-feedback`, version 1. Drafts store their source, and each starter question carries its template position and any comparable metric version.

| Evidence | Actual result |
| --- | --- |
| Single-choice RED/GREEN | `1f581ee` reproduced HTTP 422 for a valid single-choice Draft. `511dc9b` implemented ordered options, persistence and per-option results. TEST-F07-I03 and TEST-F07-E02 verify authoring, submission, readback and closed counts. |
| Draft tools RED | `2cc1df7` reproduced the missing owner-only Starter endpoint. An authenticated respondent received 404 when the case expected the role check to return 403. |
| API and PostgreSQL | 48 feature tests passed. The combined Draft tools case verifies the four Starter questions, rejects direct anonymous application, tests owner and respondent boundaries, accepts just one concurrent copy, rejects a stale source, checks metric invalidation after an interpretation-only edit and revert, rejects invalid subset IDs and rechecks current membership at publication. The frozen subset gates respondent access after membership changes. |
| Database foundation | 9 tests passed on fresh PostgreSQL 17. Prisma applied the complete migration history, and a second deploy left the same migration checksums. The new provenance and subset columns are nullable for existing records. |
| Real Chromium | 30 passed. The 1280 and 360 CSS-pixel runs exercised Starter preview, explicit removal of written feedback, anonymous mode, persisted subset after reopening, source copy, keyboard question/option ordering and invalid options. Sprint 1, F-06 and smaller viewport/zoom cases remained in the suite. |
| Build and application regression | Typecheck and production build passed. 70 unit tests and 13 HTTP API smoke tests passed. |

The F-06 threshold test runs against both RATING and SINGLE_CHOICE. A suppressed distribution and answered count stay out of the JSON result. CSV and course trends still need their own integration evidence. Production acceptance of F-06 also needs the deployed log and correlation inspection from [PR #80 review](https://github.com/Maibokdaimhai/LECTRA/pull/80#pullrequestreview-6096246108).
