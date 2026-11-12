# Deliverable 1 — assessed Sprint 1 report

Current file: **[lectra-deliverable-1.pdf](lectra-deliverable-1.pdf)**, 266 pages, complete Parts A-F, prepared for team review on 2026-11-12. The old `lectra-deliverable-1-review-draft.pdf` is retained only as historical draft evidence; it is superseded by this assessed-release report.

- Assessed application: annotated tag **sprint-1**, target **af2e1030984bcc816081b25b29c9de52a80efe30**.
- Actual main checks: **214 selected tests passed**, zero final failures/skips; typecheck/build/ORM/built-process restart passed. Details: [main release](../sprints/sprint-1/main-release.md).
- Report source revision is printed on the cover and in [PDF verification](pdf-verification.json). The later PDF publication commit is separate from the immutable app/tag.
- Confirmed roster/account mapping, actual observed contributions/reviews, AI use and unreported pair-work boundary are embedded. No hours, pairing, personal comprehension or human execution is invented.
- All 113 S1 AC are mapped to planned tests and selected actual source/cases. Partial/Not run/manual limits remain explicit; actual release reviewer accepted bounded G-04 dispositions.

## Actual navigation

| Part | Pages | Content |
| --- | --- | --- |
| A | 3-29 | Complete SRS, scope and decisions |
| B | 30-43 | Features and requirement traceability |
| C | 44-72 | System SDS, visual architecture and data foundation |
| D | 73-94 | Three-sprint plan, workflow and tracker |
| E | 95-220 | All five full feature contracts, AC, STS and Product DoD |
| F | 221-266 | Exact-main checks, current demonstrations, all AC results, test excerpts, actual reviews/TDD/history, contributions, board and limitations |

## Reproduction and review

From this report source revision, run `python3 scripts/build-deliverable-report.py` with ReportLab/pypdf/Pillow and the documented Unicode fonts. The output is `output/pdf/lectra-deliverable-1.pdf`; build twice when pagination changes to refresh the actual-range navigation. The builder never reads private environment/credential files. Verify page ranges and re-render affected pages before replacing the report.

Before team submission, review the assembled report and the stated contribution/limitations. This work did not submit to LEB2 or claim compliance with the original 8 November deadline. Issue #26 remains report/PR review follow-through; #8 remains the overall delivery tracker until that completion is accepted.
