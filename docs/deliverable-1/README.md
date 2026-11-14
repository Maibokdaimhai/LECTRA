# Deliverable 1 — corrected Sprint 1 assessment report

Current file: [lectra-deliverable-1.pdf](lectra-deliverable-1.pdf), 279 pages, complete Parts A–F. Assessed application: **sprint-1.1 → b458cb65736029f5c7de55e49c9afd6bc8de702a**, reviewed/merged through PR #48. Exact-main verification passed **219 selected tests / 0 failed / 0 skipped**, plus typecheck/build/ORM/actual built-process restart. See [current release](../sprints/sprint-1/corrected-main-release.md) and [source-bound results](../sprints/sprint-1/corrected-main-verification.json).

PR46-DEF-01 is corrected and its 5 focused PostgreSQL regressions pass on the assessed main. Original RED evidence, original 214-pass release, original 3-pass/2-fail investigation and immutable sprint-1 tag remain historical and unchanged. Current evidence is never a retrospective sum.

All 113 AC and 183 original planned STS cases are embedded. Named source ranges, demonstrated assertions and limitations are retained; process/history is distinct from automated tests. AC-F05-08 explicitly retains the Minor score-label/order assertion gap accepted in actual PR #46 and releasePR #48 reviews. Other Partial entries disclose larger unexecuted permutations/manual conditions, not hidden failures or blanket full-AC certification.

## Actual navigation

| Part | Pages | Content |
| --- | --- | --- |
| A | 3-29 | Complete SRS, scope and decisions |
| B | 30-43 | Features and requirement traceability |
| C | 44-72 | System SDS, visual architecture and data foundation |
| D | 73-94 | Three-sprint plan, workflow and tracker |
| E | 95-220 | Five full feature contracts, AC, STS and Product DoD |
| F | 221-279 | Current exact-main 219 results/demos, all AC evidence, RED/GREEN, reviews/history/contributions and accepted limitations |

## Reproduction and version boundary

Run `python3 scripts/render-ac-results.py` to validate all 113 canonical mappings against unchanged planned IDs and exact named callback ranges. Run `python3 scripts/build-deliverable-report.py` with ReportLab/pypdf/Pillow and ArialUnicode/TahomaBold fonts (or the documented font environment overrides). Build twice if pagination changes. Output: `output/pdf/lectra-deliverable-1.pdf`. The cover identifies the committed report source; the later PDF publication commit is separate from the app/tag. Current page/hash QA is in pdf-verification.json.

Current application and authentication figures are actual captures of corrected main. Historical original-release GitHub figures are explicitly labelled; actual current PR #48 review text/version is embedded. The authenticated board snapshot reports its observed 23 Done and 2 open follow-through items, not fabricated all-Done state. Actual final issue closure may follow the photographed state.

Roster/account identities were owner-confirmed. Contributions use actual artifacts/reviews, disclose AI assistance, and invent no pairing/hours or unaided human execution. Course submission is a separate human action; no LEB2 submission or original-deadline compliance is claimed.

Historical originals are retained in Git and `historical-evidence/`; prior QA records and original investigation files are not rewritten. The executable regression remains PR #47's canonical enhanced source; see r47-01-integration.md for original ownership/synchronization provenance.
