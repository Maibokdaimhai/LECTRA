# F-08 Aggregate results CSV

Deliverable 2 contract v0.1, 27 November 2026. Proposed for teammate review. FR-07/10, BR-01/02/12/13/16, NFR-01/06/07. The existing results projection is authoritative.

## Design and workflow

The Closed owner results page offers Download CSV with an accessible status on failure. GET /api/surveys/:id/results.csv requires authenticated OWNER, the same ownership predicate used by the JSON results route, and a Closed survey. Guest 401, student 403, other owner 404, owned unfinished survey 409, invalid route/query 422. Use the existing protected request and no-store policy. The export reads one consistent authorized results snapshot. It needs no database migration or new persisted data.

Return UTF-8 text/csv with BOM and CRLF, attachment name survey-results.csv, and a stable header consisting of question_position, question, type, status, answered, mean, option, count. Double any embedded double quotes and quote text fields. Prefix an apostrophe for labels whose leading non-whitespace character is =, +, -, or @, or when leading control characters might make a spreadsheet interpret a formula. Use numeric serialization for numeric columns. No question IDs, user identifiers, emails, raw feedback, answer rows or private notes.

A rating emits five score rows with the authorized answered count and mean. A single-choice question emits one row per authorized option, with count and no mean. Suppressed quantitative questions emit one status row with blank numeric and option cells. Preserve explicit no-data semantics for identified questions. Omit TEXT rows. The status and numeric values must match JSON visibility exactly, including future anonymous projection. No anonymous export is accepted until F-06 shares the projection and passes integrated checks.

| AC | Planned test and level | Preconditions and input | Expected result |
| --- | --- | --- | --- |
| AC-F08-01 FR-10 BR-02 | TEST-F08-I01 real API/DB | Owner, student, other owner and guest try a Closed result export. Try Published as owner. | Only the rightful Closed owner receives CSV. Guest/role/scope/state errors contain no result data. |
| AC-F08-02 BR-12/16 | TEST-F08-U01 unit, I02 API/DB | Saved rating, omitted optional answer, text comment, quoted/formula-like question and option labels. | Correct denominator, distribution, escaped text and no raw response/comment/identity data. Stable parseable CSV. |
| AC-F08-03 BR-13/16 NFR-06 | TEST-F08-I03 API/DB | Closed anonymous questions with releasable and suppressed results. | Numeric columns appear only for releasable questions. CSV and JSON agree. |
| AC-F08-04 NFR-07 | TEST-F08-E01 UI, M01 spreadsheet | Open Closed results by keyboard, download and load file. Repeat with non-ASCII labels and unavailable session. | Download opens cleanly in the selected reader, safe labels remain literal and UI reports errors. |

**Done when** OPEN-09 reader/encoding rules have teammate disposition, build and all scoped tests pass, the review confirms guard/projection reuse, and release evidence includes a real persisted/exported result.
