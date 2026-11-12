# Deliverable 1 — assessed Sprint 1 report

Current file: **[lectra-deliverable-1.pdf](lectra-deliverable-1.pdf)**, 275 pages, complete Parts A-F, prepared for team review on 2026-11-12 with the final evidence corrections and supplementary authentication captures on 2026-11-13. The old `lectra-deliverable-1-review-draft.pdf` is retained only as historical draft evidence; it is superseded by this assessed-release report.

- Assessed application: annotated tag **sprint-1**, target **af2e1030984bcc816081b25b29c9de52a80efe30**.
- Historical main release checks: **214 selected tests passed**, zero final failures/skips; typecheck/build/ORM/built-process restart passed. Details: [main release](../sprints/sprint-1/main-release.md). The separate new [post-release direct AC checks](post-release-ac-verification.md) have **3 PASS / 2 FAIL / 0 skipped** and reveal conditional readback defect **PR46-DEF-01**; no production correction or new acceptance is claimed.
- Report source revision is printed on the cover and in [PDF verification](pdf-verification.json). The later PDF publication commit is separate from the immutable app/tag.
- Confirmed roster/account mapping, actual observed contributions/reviews, AI use and unreported pair-work boundary are embedded. No hours, pairing, personal comprehension or human execution is invented.
- All 113 S1 AC list planned tests and actual source/cases where established. New direct checks support the F-05 API rejection branches, while AC-F04-22 has passing submission and failing own-readback checks. Other 110 AC records, planned IDs and historical dispositions are preserved; the new failure is explicit and unresolved.
- [Supplementary authentication demonstration](auth-demonstration.json): actual assessed-source Login, Owner identity, confirmed Logout and protected-request denial. These unchanged captures are separate from both the historical 214-test result and new post-release AC checks; figures F-AUTH-01-04 are now on pages 257-260.

## Actual navigation

| Part | Pages | Content |
| --- | --- | --- |
| A | 3-29 | Complete SRS, scope and decisions |
| B | 30-43 | Features and requirement traceability |
| C | 44-72 | System SDS, visual architecture and data foundation |
| D | 73-94 | Three-sprint plan, workflow and tracker |
| E | 95-220 | All five full feature contracts, AC, STS and Product DoD |
| F | 221-275 | Exact-main checks, current demonstrations, all AC results, test excerpts, actual reviews/TDD/history, contributions, board and limitations |

## Reproduction and review

From this report source revision, run `python3 scripts/build-deliverable-report.py` with ReportLab/pypdf/Pillow and the documented Unicode fonts. The output is `output/pdf/lectra-deliverable-1.pdf`; build twice when pagination changes to refresh the actual-range navigation. The builder never reads private environment/credential files. Verify page ranges and re-render affected pages before replacing the report.

Before team submission, review the assembled report and the stated contribution/limitations. This work did not submit to LEB2 or claim compliance with the original 8 November deadline. Issue #26 remains report/PR review follow-through; #8 remains the overall delivery tracker until that completion is accepted.

## Final known-limitation disposition

Team decision: PR46-DEF-01 is a Known Limitation discovered during additional post-release verification. PR46-I04-PUBLISHED and PR46-I04-CLOSED are two observations of the same underlying unsupported-mode own-readback defect. AC-F04-22 remains a Sprint 1 AC with Partial disposition. Correction is deferred for team follow-up in Sprint 2 before enabling F-06 Anonymous Mode; regression tests must be rerun after correction. The defect is not fixed. The existing Sprint Plan and original assessed release are unchanged.

Historical release: 214 Passed / 0 Failed / 0 Skipped. Additional verification: PR46-I01, PR46-I02 and PR46-I03 PASS; PR46-I04-PUBLISHED and PR46-I04-CLOSED FAIL. These totals remain separate; neither the passing additions nor the known-limitation decision imply full AC completion.
