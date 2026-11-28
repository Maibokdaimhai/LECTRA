# F-09 Survey history and comparable trends

Deliverable 2 contract v0.2, 28 November 2026. Songwit approved the direction with clarifications. See the [review disposition](../deliverable-2-contract-review.md). FR-02/11, BR-01/02/12/13/18/19 and NFR-01/04/06/07. Use existing Course, Section, Lecture, Survey and authorized result records.

## Design and workflow

- Add an owner history filter atop the existing paginated owned Survey list. GET /api/surveys extends its owner query with courseId, sectionId, dateFrom, dateTo and status. Filters combine with AND. Validate owned context, strict YYYY-MM-DD real dates, inclusive bounds, ascending period and Draft/Published/Closed states; no filter defaults to the existing list. Retain ordering and pagination. Respondent discovery cannot accept owner filter inputs or expose Drafts. Partial progress for Deliverable 2 is working persisted history filtering.
- The later trends view consumes only compatible Closed rating questions with an immutable metric definition of the same version, wording, type, anchors and interpretation. Use source metric provenance from F-07, partition by mode, and apply F-06 release policy before computing results. List per-lecture values and answered counts; group summaries by owned context/metric and compute from answer sum and count, exposing contributing lectures. Use visible answered observations rather than unique student counts. Apply per-question suppression before any cross-lecture or Course aggregation. A suppressed question contributes zero observations and no contributing lecture to the pool. Notes stay private.
- The filtered listing needs no new persistence. Trend queries read from the stored responses and metric provenance. No global rank or cross-owner analytics. Unauthorized access uses safe scoped errors; malformed criteria returns 422. The UI labels context and date range, and supports clearing filters and opening an existing survey.

| AC | Planned test and level | Input and preconditions | Expected result |
| --- | --- | --- | --- |
| AC-F09-01 FR-11 | TEST-F09-I01 API/DB, E01 UI | Multiple persisted lectures across dates and scopes, mixed states. Apply filters singly and combined with equal inclusive endpoints. | Scoped ordered results, retained historical surveys, correct paging/count and empty state. |
| AC-F09-02 BR-01/02 | TEST-F09-I02 API/DB | Guest, respondent, foreign Section same Course, malformed date, inverted range, repeated filter. | Guest/role errors or safe validation/empty result, no foreign or Draft disclosure. Existing respondent discovery continues. |
| AC-F09-03 BR-18 | TEST-F09-I03 API/DB | Source-compatible questions and same-title edited or unversioned questions. | Only compatible metric version groups; the rest remain individual survey results. |
| AC-F09-04 BR-13/19 | TEST-F09-I04 API/DB, TEST-F09-I06 API/DB, TEST-F09-E02 UI | Two releasable compatible Closed anonymous lectures use bins [3,0,0,0,3] and [0,0,0,0,5]. A third compatible lecture has [0,0,0,2,4] and is suppressed. Include an identified lecture in a separate mode. | The anonymous course mean is 3.91 from 11 visible answers and two lectures. The suppressed question and its numeric values do not appear in the per-lecture series or alter the course mean, denominator or count of contributing lectures. Identified results remain in their own partition. |
| AC-F09-05 NFR-04/07 | TEST-F09-E03 UI, M01 measurement | Keyboard at 360 and 1280 pixels and controlled load dataset per SRS. | Usable loading/error/result states and a measured, disclosed performance result. |

**Done when** implemented and reviewed AC have versioned real API/DB and selected browser evidence; distinguish history completion from trends and load verification until the latter pass.
