# F-08 Aggregate results CSV

Deliverable 2 contract v0.2, 28 November 2026. Songwit approved the direction with clarifications. See the [review disposition](../deliverable-2-contract-review.md). FR-07/10, BR-01/02/12/13/16, NFR-01/06/07. The existing results projection is authoritative.

## Design and workflow

The Closed owner results page offers Download CSV with an accessible status on failure. GET /api/surveys/:id/results.csv requires authenticated OWNER, the same ownership predicate used by the JSON results route, and a Closed survey. Guest 401, student 403, other owner 404, owned unfinished survey 409, invalid route/query 422. Use the existing protected request and no-store policy. The export reads one consistent authorized results snapshot. It needs no database migration or new persisted data.

Return `text/csv; charset=utf-8` as attachment `survey-results.csv`, with CRLF and a proposed UTF-8 BOM. CSV v1 uses the following fixed header in the order shown, aligned with System SDS §13.

```text
format_version,course_code,section_code,term,lecture_title,lecture_date,survey_id,survey_title,survey_mode,question_id,question_category,question_prompt,question_type,result_status,answered_count,mean,rating_score,option_label,bin_count
```

Set format_version to 1 on each row and use ISO dates. Leave question_category empty when the survey predates category metadata. Double embedded quotes and quote text fields. Prefix an apostrophe when a text value begins with a formula trigger (=, +, -, @) after leading whitespace or begins with a spreadsheet-sensitive control character. Serialize numeric values as numeric cells. Survey and question IDs are context metadata. Exclude account identifiers, individual answer rows, comments and notes.

Each releasable rating emits one row per rating_score 1–5 with bin_count, answered_count and mean. Each releasable single-choice question emits one row per option_label and bin_count, with mean and rating_score empty. Suppressed quantitative questions emit one metadata row with result_status SUPPRESSED and blank answered_count, mean, rating_score, option_label and bin_count. Identified questions with zero answers emit one NO_DATA row with answered_count 0 and blank mean, rating_score, option_label and bin_count. Omit TEXT rows. The status and numeric values must match JSON visibility exactly, including future anonymous projection. No anonymous export is accepted until F-06 shares the projection and passes integrated checks.

| AC | Planned test and level | Preconditions and input | Expected result |
| --- | --- | --- | --- |
| AC-F08-01 FR-10 BR-02 | TEST-F08-I01 real API/DB | Owner, student, other owner and guest try a Closed result export. Try Published as owner. | Only the rightful Closed owner receives CSV. Guest/role/scope/state errors contain no result data. |
| AC-F08-02 BR-12/16 | TEST-F08-U01 unit, I02 API/DB | Saved rating, omitted optional answer, text comment, quoted/formula-like question and option labels. | Exact v1 header order and context metadata, rating_score 1–5 distinct from bin_count, correct answered denominator, escaped text and no raw response/comment/identity data. |
| AC-F08-03 BR-13/16 NFR-06 | TEST-F08-I03 API/DB | Closed anonymous questions with releasable and suppressed results. | CSV and JSON agree on release. A metadata-only suppressed row has blank numeric and option cells, including mean and answered_count. |
| AC-F08-04 NFR-07 | TEST-F08-E01 UI, M01 spreadsheet | Open Closed results by keyboard, download and load file. Repeat with non-ASCII labels and unavailable session. | Download opens cleanly in the selected reader, safe labels remain literal and UI reports errors. |

**Done when** the OPEN-09 target reader and BOM/formula compatibility have teammate disposition, build and all scoped tests pass, the review confirms guard/projection reuse, and release evidence includes a real persisted/exported result.
