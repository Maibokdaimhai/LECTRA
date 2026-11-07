# Deliverable 1 - Planned Evidence Register

Version 0.1, 2026-11-06; #6 plan, #26 actual capture/assembly. All runtime/demo/result fields below are **Not run / not available**, all real review/release fields **Pending**. This file contains no fabricated PASS/FAIL/skip count, test source, review, contribution or release SHA. See [plan](evidence-plan.md) and [PDF outline](report-outline.md).

## 1. AC-to-planned/actual-test mapping

F-01 IDs/coverage below use the actual draft [contract at fc64e2c](https://github.com/Maibokdaimhai/LECTRA/blob/fc64e2cc16557d77d67ef278d56e05c86c2621fc/docs/sprints/sprint-1/f-01-authentication.md) and [STS at fc64e2c](https://github.com/Maibokdaimhai/LECTRA/blob/fc64e2cc16557d77d67ef278d56e05c86c2621fc/docs/sprints/sprint-1/f-01-authentication-sts.md), proposed in PR #29. U=unit, I=API/DB (including labelled guard/fault variants), E=selected UI/E2E, M=supplementary/manual/process, H=dependent real-domain integration. Bare suffixes inherit TEST-F01-. This is draft planned coverage, not accepted or executed tests.

For every row, **actual test file/case, command/run, implementation SHA, observed result/counts and evidence/PDF page are Not run / not available** until supplied. After execution, expand each AC/test pair into its own actual-result row using section 2; preserve failed/skipped/not-run cases. Process/manual checks cannot be counted as automated passes.

| Feature / requirement | Draft AC | Planned STS IDs / levels |
| --- | --- | --- |
| F-01 / FR-01 | AC-F01-01 | TEST-F01-I01, I27 |
| F-01 / BR-01, NFR-01 | AC-F01-02 | TEST-F01-U01, I06, I15 |
| F-01 / FR-01 | AC-F01-03 | TEST-F01-I03, I04, E01 |
| F-01 / FR-01, NFR-01 | AC-F01-04 | TEST-F01-I05, I28 |
| F-01 / FR-01, NFR-01 | AC-F01-05 | TEST-F01-U06, I24, I26 |
| F-01 / FR-01, BR-01 | AC-F01-06 | TEST-F01-I07, I13 |
| F-01 / FR-01, NFR-01 | AC-F01-07 | TEST-F01-U02, U07, I08, I20 |
| F-01 / BR-01/02, NFR-01 | AC-F01-08 | TEST-F01-I09, I15 |
| F-01 / FR-01 | AC-F01-09 | TEST-F01-I16, I17, E02 |
| F-01 / BR-01, NFR-01 | AC-F01-10 | TEST-F01-U03, I13, I14, I17, E04 |
| F-01 / NFR-01/03 | AC-F01-11 | TEST-F01-I02, I25, M02 |
| F-01 / BR-01/02, NFR-01 | AC-F01-12 | TEST-F01-U04, I10, I11, I12, H01-H04 |
| F-01 / FR-01, NFR-01 | AC-F01-13 | TEST-F01-I18, I26, E05 |
| F-01 / NFR-01 | AC-F01-14 | TEST-F01-U05, I23, E02, E03 |
| F-01 / NFR-07 | AC-F01-15 | TEST-F01-E01, E04, M01 |
| F-01 / FR-01, NFR-07 | AC-F01-16 | TEST-F01-E02, E03, E05 |
| F-01 / NFR-03 | AC-F01-17 | TEST-F01-I20, I24, I25, M02 |
| F-01 / NFR-01 | AC-F01-18 | TEST-F01-I22 |
| F-01 / FR-01, NFR-01 | AC-F01-19 | TEST-F01-I19, I21 |
| F-01 / NFR-05/08 | AC-F01-20 | TEST-F01-M03 |
| F-02 / FR-02/12, BR-01-04/23 | Pending accepted #11 AC | Pending actual STS; add context/access/discovery/pagination cases, no invented IDs. |
| F-03 / FR-03/04, BR-02-05/07/09-11/14/23 | Pending accepted #12 AC | Pending actual STS; lifecycle/freeze/ownership/publication/concurrency. |
| F-04 / FR-05/06, BR-01-08/10/11/14 | Pending accepted #13 AC | Pending actual STS; validation/byte bounds/atomic duplicates/close race/own readback. |
| F-05 / FR-07, BR-02/12-14/16 | Pending accepted #14 AC | Pending actual STS; results/denominators/projection/access/restart. |

The 20 F-01 rows do not prove all S1 AC are specified. Extend from each real accepted contract and preserve exact IDs/versions; reconcile cross-feature H-case ownership and actual results under #22. Requirement baseline remains [traceability](../traceability.md); actual observation/result detail belongs below, not in a fake coverage percentage.

## 2. Actual-run record schema (unfilled)

| Field | Current value / rule |
| --- | --- |
| Requirement / feature / AC / STS / level | Resolve from accepted contract; current plan references above only. |
| Actual source/test file and case name | Not available; do not substitute proposed paths. |
| Command and date/environment | Not run; include actual Node/OS/PostgreSQL/lockfile/schema/fixture configuration when run. |
| Tested implementation SHA / run reference | Not available; planning-source SHA above is not an app release. |
| Expected / observed outcome | Expected from accepted STS; observed Not run. |
| Pass/fail/skip counts | Not available; do not fill zeros to imply a run happened. Manual checks separate. |
| Safe output and screenshot/excerpt reference | Not available; scrub secrets without changing outcomes. |
| Actual PDF page / exception / defect follow-up | Pending assembly/real finding. |

Use one record for each actual result/version; re-tests after fixes preserve earlier failure references. Planned, Not run, PASS, FAIL, runner SKIP and scoped N/A are distinct. Unknown/missing results remain gaps; never reconstruct them from expected outcomes.

## 3. Build/release/demo/excerpt slots

| Planned capture | Actual command/source / tested SHA | Observed result / evidence |
| --- | --- | --- |
| Build and typecheck | Not run / no command established yet | Not available; #15/#24 provide real commands. |
| Unit suite | Not run | Not available; actual names/counts required. |
| API/real PostgreSQL suite | Not run | Not available; include DB safeguards/schema and assertions. |
| Selected browser suite/manual checks | Not run | Not available; automated/manual separated. |
| Integrated staging verification #22/#23 | Not run | Not available; no integrated app. |
| Assessed main post-merge verification #25 | Not run / release SHA pending | Not available; no accepted product release. |
| DEMO-S1-01-05 | Not run / common release SHA pending | No screenshots/API/DB outcomes captured. |
| Domain-rule automated excerpt | Actual #13/#20 test file/lines/ID/version pending | Execution and intended RED/GREEN output pending. |
| Role/ownership automated excerpt | Actual #12/#19 test file/lines/ID/version pending | Real API/DB restriction assertions/results pending. |

## 4. Process and contribution slots

| Planned sample | Actual Issue/branch/PR/author/reviewer/review/version | Status |
| --- | --- | --- |
| Completed implementation sample 1 | Candidate #19 F-03; actual PR/review/integration/main evidence pending | Not completed by this plan. |
| Completed implementation sample 2 | Candidate #20 F-04; actual PR/review/integration/main evidence pending | Not completed by this plan. |
| Contract/STS -> implementation/TDD history | Actual source commits/dates/results and acceptance pending | Draft F-01 source known, human acceptance/implementation unavailable. |
| Final board | [LECTRA Kanban](https://github.com/users/Maibokdaimhai/projects/7), final snapshot date/version pending | Existing operational board is not final release status. |
| Reviewed staging-to-main release / immutable tag/SHA | Pending actual #25 | No merge/release/approval invented. |

| Member | Actual contribution / artifact / version / pair work | Review/participation evidence |
| --- | --- | --- |
| Maibokdaimhai | To record real work when confirmed; assignment/AI draft is not completed app contribution | Pending actual evidence. |
| R1NNE0 | To record real work when confirmed; no availability or completed contribution inferred | Pending actual evidence. |

AI-use declaration must describe actual help and human checks. This plan was AI-assisted under the owner's instructions; it does not demonstrate either student's understanding/review. Final declaration should name the actual uses, verification performed by the students and limits, without an invented prompt transcript or fabricated approval.

| Known current gap | Impact / next work |
| --- | --- |
| No application/runtime tests/release/PDF yet | Actual EV-S1-02-12 collection awaits implementation/integration/release and #26 assembly. |
| Other contracts and human adoption pending | Extend AC mappings from #11-#14 and accepted #5/#10 versions; never mark missing contract coverage passed. |
| Actual names/IDs/availability not supplied | Use owner/team-supplied identities for PDF; confirm bounded capture/review tasks without inventing private schedules. |

The final limitation list must reflect the actual assessed release, including failed/skipped/not-run required checks and their impact; do not carry forward this planning snapshot as if it were the final product audit.
