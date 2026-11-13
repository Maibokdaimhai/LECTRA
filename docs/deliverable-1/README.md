# Deliverable 1 — assessed Sprint 1 report

Current file: **[lectra-deliverable-1.pdf](lectra-deliverable-1.pdf)**, 284 pages, complete Parts A-F, prepared for team review on 2026-11-12 with the final evidence corrections and supplementary authentication captures on 2026-11-13. The old `lectra-deliverable-1-review-draft.pdf` is retained only as historical draft evidence; it is superseded by this assessed-release report.

- Assessed application: annotated tag **sprint-1**, target **af2e1030984bcc816081b25b29c9de52a80efe30**.
- Historical main release checks: **214 selected tests passed**, zero final failures/skips; typecheck/build/ORM/built-process restart passed. Details: [main release](../sprints/sprint-1/main-release.md). The separate new [post-release direct AC checks](post-release-ac-verification.md) have **3 PASS / 2 FAIL / 0 skipped** and reveal conditional readback defect **PR46-DEF-01**; the assessed release is unchanged; candidate correction PR #47 is separate and has no claimed human acceptance.
- Report source revision is printed on the cover and in [PDF verification](pdf-verification.json). The later PDF publication commit is separate from the immutable app/tag.
- Confirmed roster/account mapping, actual observed contributions/reviews, AI use and unreported pair-work boundary are embedded. No hours, pairing, personal comprehension or human execution is invented.
- All 113 S1 AC list planned tests and actual source/cases where established. New direct checks support the F-05 API rejection branches, while AC-F04-22 has passing submission and failing own-readback checks. All 113 rows were re-audited against real assertions and process records; missing conditions remain explicit. The new failure is unresolved on the assessed tag, with a separately verified PR #47 correction candidate.
- [Supplementary authentication demonstration](auth-demonstration.json): actual assessed-source Login, Owner identity, confirmed Logout and protected-request denial. These unchanged captures are separate from both the historical 214-test result and new post-release AC checks; figures F-AUTH-01-04 appear in Part F; actual pages are indexed in pdf-verification.json.

## Actual navigation

| Part | Pages | Content |
| --- | --- | --- |
| A | 3-29 | Complete SRS, scope and decisions |
| B | 30-43 | Features and requirement traceability |
| C | 44-72 | System SDS, visual architecture and data foundation |
| D | 73-94 | Three-sprint plan, workflow and tracker |
| E | 95-220 | All five full feature contracts, AC, STS and Product DoD |
| F | 221-284 | Exact-main checks, current demonstrations, all AC results, test excerpts, actual reviews/TDD/history, contributions, board and limitations |

## Reproduction and review

From this report source revision, run `python3 scripts/build-deliverable-report.py` with ReportLab/pypdf/Pillow and the documented Unicode fonts. The output is `output/pdf/lectra-deliverable-1.pdf`; build twice when pagination changes to refresh the actual-range navigation. The builder never reads private environment/credential files. Verify page ranges and re-render affected pages before replacing the report.

Before team submission, review the assembled report and the stated contribution/limitations. This work did not submit to LEB2 or claim compliance with the original 8 November deadline. Issue #26 remains report/PR review follow-through; #8 remains the overall delivery tracker until that completion is accepted.

## Final known-limitation disposition

PR46-DEF-01 remains reproducible on the immutable assessed release af2e103; the original 3-PASS/2-FAIL record is preserved. A separate minimal Sprint 1 defensive correction has now been implemented and verified in [PR #47](https://github.com/Maibokdaimhai/LECTRA/pull/47), source 609bbcd36d3d3a5baeb9829ed9d36876ec5fe17e. It rejects unsupported-mode own readback after authorization and before answer reads. Real PostgreSQL verification passed 5 regression, 41 feature and 7 release cases (53 selected), plus typecheck/build/built-process restart. The RED version eef5e75 reproduced 3 PASS / 2 FAIL first. Candidate evidence is retained in mode-readback-correction.json/md and its raw logs. This does not enable F-06, modify the production enum, replace the old tag, establish human approval or claim the original release was fixed. AC-F04-22 stays Partial for that assessed release. The earlier proposal to defer the guard to Sprint 2 is superseded by this separate correction candidate; it was not an instructor requirement or a newly accepted waiver. Actual teammate review and release integration remain separate gates.

Historical release: 214 Passed / 0 Failed / 0 Skipped. Additional verification: PR46-I01, PR46-I02 and PR46-I03 PASS; PR46-I04-PUBLISHED and PR46-I04-CLOSED FAIL. These totals remain separate; neither the passing additions nor the known-limitation decision imply full AC completion.

## Final assertion audit and acceptance boundary

The 13 November audit inspects all 113 AC and retains all 183 original planned STS cases. The canonical JSON records exact named callback ranges, demonstrated assertions, provenance, status and remaining conditions. `python3 scripts/render-ac-results.py` validates unchanged planned mappings and source references before rendering. Process AC cite actual version/review/history, not unrelated integration tests. See `ac-assertion-audit.json`. No percentages are presented as exhaustive certification.

The report is self-contained for assessment of the immutable original release, including its disclosed failure; a PDF can report incomplete work honestly. It is not a claim that all Product DoD/AC are satisfied. To assess a corrected release instead: independently review/integrate PR #47, run required checks on the resulting main commit, record a new tag without moving sprint-1, and rebuild the cover/results/evidence against that actual commit. Actual teammate report review and course submission are still human actions.

## Canonical regression source after R47-01

The executable post-release suite is synchronized byte-for-byte with PR #47's enhanced version. [Integration record](r47-01-integration.md) identifies canonical ownership and the archived original investigation source. Historical 3-PASS/2-FAIL results, RED evidence, 214-PASS release results and the PDF source revision remain unchanged; no enhanced-test execution is retroactively attributed to the original run.
