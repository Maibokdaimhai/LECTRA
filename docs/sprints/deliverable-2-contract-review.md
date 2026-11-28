# Deliverable 2 contract review

Review supplied by Thanawat on 28 November 2026 ICT and attributed to Songwit Rueangsawat. It was provided as review text, outside GitHub's pull-request review system. Baseline reviewed: v0.1 at `6aba863`.

**Verdict.** Approved with documentation clarifications. Songwit agreed with prohibiting anonymous TEXT and with the per-question 5/3 disclosure policy, and supported the Sprint 2 and Sprint 3 scope. His review requested the following changes before treating the contracts as finalized for implementation.

| Review item | Recorded disposition in v0.2 |
| --- | --- |
| 1. F-06 own-submission shape | GET returns exactly `{surveyId, submitted}` inside the normal data envelope. Anonymous POST success uses the same two-field shape. TEST-F06-I03 covers both responses. |
| 2. F-06 Closed response count | The authorized owner keeps the committed survey-level count in Published and Closed states. Question-level numbers still follow suppression. |
| 3. F-06 quantitative boundaries | TEST-F06-I04R and TEST-F06-I04C run the same 4/5 and sparse 2/3 boundaries for ratings and choices. |
| 4. F-06 limits of disclosure controls | Both contract and system policies document residual inference risk and the limits of the 5/3 rules. |
| 5. F-07 starter and comparability | Preview warns about the optional TEXT. The full starter creates an identified Draft; remove the TEXT explicitly before switching to anonymous. Interpretation-only edits clear the comparable metric reference. |
| 6. F-08 CSV schema | CSV v1 uses the System SDS §13 context and question fields, and separate rating_score, option_label and bin_count cells. Target spreadsheet reader still needs confirmation for OPEN-09. |
| 7. F-09 suppression regression | TEST-F09-I06 verifies a suppressed question cannot alter either cross-lecture observations or Course-level mean, answer count or contributing-lecture count. The case remains planned until trends are implemented. |
| 8. F-10 field name | Specify `plannedAction` in the API and stored note. An API body using `plannedImprovement` fails validation. |

Implementation, test execution and code-review status are recorded separately. This review does not represent an approval event on GitHub.
