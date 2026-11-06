# Deliverable 1 - Evidence Capture Plan

Version 0.2, 2026-11-06: synchronized with staging and corrected documentation-PR history after [PR #30 review](https://github.com/Maibokdaimhai/LECTRA/pull/30#pullrequestreview-5803367771). Related [#6](https://github.com/Maibokdaimhai/LECTRA/issues/6); actual execution/PDF assembly [#26](https://github.com/Maibokdaimhai/LECTRA/issues/26). Lead: Maibokdaimhai, with AI assistance; reviewer: R1NNE0 (changes requested; re-review pending). The Issue remains shared. No approval, application build/test, assessed release, implementation contribution or final PDF is supplied by this plan.

Companion documents: [report outline](report-outline.md) and [evidence register](evidence-register.md). Whole-product sources: [SRS](../srs.md), [features](../features.md), [traceability](../traceability.md), [System SDS](../system-sds.md), [sprint plan](../sprints/plan.md). Shared Part E/F-01 draft sources are in [PR #29](https://github.com/Maibokdaimhai/LECTRA/pull/29), independent of this branch; exact F-01 mapping source is commit `fc64e2cc16557d77d67ef278d56e05c86c2621fc`. Referencing that source does not claim it is merged/approved or that other contracts exist.

## 1. Authority and current boundary

Instructor sources: `project_deliverable_1_v1.pdf` sections 3.5-3.6 and 4-5, and `group_work_specs_v1.pdf` sections 5-8. Deliverable 1 is one self-contained team PDF containing complete A-E and selected assessable F evidence, due 8 November 2026 at 23:59 Asia/Bangkok. The PDF needs readable actual page navigation, both students' names/IDs, theme/context, repository and immutable assessed release reference. Repo sources supplement the PDF; external specification links do not replace its required contents.

The instructor specifically requires real local workflow/persistence/access demonstrations, release-linked build/test output and AC results, two short excerpts of actual automated tests (domain rule and role/ownership restriction), selected evidence for two completed Issues/PRs with substantive review/integration, history/TDD, contributions, AI use and limitations. Docker/completed CI/CD/GCP and a separate demo video are not Deliverable 1 requirements; deployment is assessed in Lab 5. The EV/DEMO IDs, filenames and capture allocation below are proposed team conventions, not additional instructor quotas.

#6 can be reviewed/accepted as an evidence plan before implementation. #26 must later replace planned fields with genuine observations and assemble/check the PDF. Completing #6 does not complete Part F, #5, #8, #25 or #26. Other feature AC/STS become available from #11-#14; plan capture now and extend their mappings when actually recorded, without inventing AC IDs or retroactive history.

## 2. Capture moments and responsibilities

| Evidence ID | Capture when / responsible work | Retain and include |
| --- | --- | --- |
| EV-S1-01 | Each child contract and #5 common review, before its implementation | Actual design/STS/DoD commit/date and substantive opposite-member review; full final A-E content in the PDF, selected real sequence in F. |
| EV-S1-02 | Important rule/defect implementation, by its lead with teammate inspection | Intended-behavior RED result/version and later GREEN version/output; exact assertion and explanation. Do not recreate an older failing version after the work. |
| EV-S1-03 | Each actual unit/API-DB/selected UI run | Actual command/date/environment/schema/lockfile, source/test names, SHA and observed pass/fail/skip output; update AC mapping. |
| EV-S1-04 | Integrated and accepted main release checks under #22/#23/#25 | Actual build/typecheck/test output on the identified integrated version and again required checks on the assessed main release, with truthful limitations. |
| EV-S1-05 | Reproducible program demo on the accepted version | DEMO-S1-01 through 05 below: actual screen/API/DB evidence with roles/preconditions/steps/expected/actual and release reference. |
| EV-S1-06 | Implementation tests exist and have genuinely run | Two short source excerpts with setup/assertion/file/line/version and actual execution: important domain rule plus role/ownership restriction. |
| EV-S1-07 | Two genuine implementation work packages are complete | Actual Issue/contract/branch/author/reviewer/PR/integration/main references and readable substantive review evidence. Candidate sample: #19 F-03 and #20 F-04, only if actually completed. |
| EV-S1-08 | Board/release is final for the assessed increment | Final board URL/date/status/assignees, actual release PR/review/tag/main SHA. Early operational board snapshots are not final completion proof. |
| EV-S1-09 | Throughout actual team work | Both students' real contributions/pair work with artifacts/versions, short accurate AI-use declaration; no equal-commit target or invented availability. |
| EV-S1-10 | Setup is implemented under #24 and reproduced | Actual prerequisites/config/migrate/seed/run/build/test instructions, safe local test access and short Part F setup summary; no fake working commands. |
| EV-S1-11 | Every failure/skip/gap or accepted scope revision | Actual defect/gap, expected/observed result, affected requirement/AC, owner/next action and assessed-release impact. Required missing behavior is not Done because a limitation is listed. |
| EV-S1-12 | Final #26 PDF assembly and audit | Complete A-F, actual contents/page ranges and captions, readable images/test excerpts, matching immutable release, secrets check and both students' supplied names/IDs. |

The feature lead captures code/test history as it occurs; the opposite member performs their real review and checks assertions/output. A shared Issue assignment is not proof either person has completed or agreed to work. Record actual bounded capture/review ownership in the implementing Issue/PR; no permanent docs-only/code-only allocation. Keep review/integration/PDF time in the actual plan without inventing hours or private schedules.

Proposed storage after execution: safe evidence files under `evidence/sprint-1/<actual-release-sha>/` or another agreed versioned location, with final selections embedded in the report. These directories/files are not created by this plan. Keep records readable and small; do not duplicate entire logs/source files in the PDF. Protect raw local temporary files and remove credentials/session tokens before retaining/publication.

## 3. Demonstration specifications

Run against the actual accepted release with isolated synthetic owner/respondent browser contexts and real API/PostgreSQL. Identify the common demo release SHA once; label any exception explicitly. Every scenario has a caption recording ID, feature/AC IDs from its accepted contract, role, initial state, short steps, expected outcome, actual outcome and evidence page. Actual outcome/screenshots remain Not run/pending now. Never switch a frontend role selector to manufacture backend identity.

| Scenario | Feature / AC source and preconditions | Steps and expected observable outcome |
| --- | --- | --- |
| DEMO-S1-01 Normal journey and persisted retrieval | F-01-F-05; map actual AC from #10-#14. Seed O-A's Section/lecture, eligible R-A, second owner/Section for access cases; no survey on target lecture. | O-A logs in, selects owned context, creates rating/text Draft, saves/reopens and publishes. R-A logs in, sees eligible Published survey and identified disclosure, submits valid answers and receives confirmed persistence. Reopen own status/answers after logout/login; stop/restart the actual app and retrieve without reseed/reset. O-A closes and sees count/known expected rating/text results without respondent identity fields. Show selected UI, authoritative API and DB readback; expected values come from synthetic fixture calculations. |
| DEMO-S1-02 Validation/boundary rejection | F-04/#13 AC pending; eligible R-B, Published survey with required question; valid identity/token. | Submit missing required/invalid rating/text-boundary input through actual form/API. Show the accepted contract's exact error and unchanged participation/bundle/answer state, correct visible field feedback and no success confirmation. Use a valid case afterward to show recoverability if the approved test design requires it. |
| DEMO-S1-03 Repeat/concurrent response rejection | F-04/#13 AC pending; one eligible respondent and Published survey; preserve actual test setup. | Submit once, then attempt sequential repeat; show the approved rejection and exactly one committed participation/bundle. Actual automated API/DB test supplies simultaneous-request proof; a screenshot of double-clicking alone does not establish concurrency correctness. |
| DEMO-S1-04 Unpublished/Closed rejection | F-02-F-04/#11-#13 AC pending; owned Draft and Closed survey with controlled eligibility/response state. | Verify respondent cannot discover/read Draft; attempt direct response request with valid auth/token and valid-shaped answers. Attempt submission after closure. Show the exact errors from accepted contracts and unchanged data; no new response. Do not invent a hidden Draft form to make the screenshot easier. |
| DEMO-S1-05 Authentication/logout and forbidden access | F-01 AC-F01-03/04/09/12/16 and dependent actual BR-02 AC. Two owners in Sections of the same Course, two respondents with separate submissions. | Show invalid/valid login and trusted /me identity. Use direct API/DB-backed tests for guest access, respondent survey management, foreign-owner management/results and cross-response read; show safe rejection/no leaked fields/no mutation. Logout, replay saved cookie in a redacted automated test, then show protected access denied and private UI cleared. Never show raw cookie/token or present a hidden button as authorization proof. |

Selected screenshots may cover several linked AC in one short sequence. Do not produce staged screenshots or screen dumps now; no app exists. Keep text feedback untrusted plain text. S1 remains identified; no anonymous/private-note/export/history demo is implied.

## 4. Automated evidence and TDD selection

For every S1 AC, the [register](evidence-register.md) will map planned STS ID/level to actual file/case/command/SHA/result/output reference. Current F-01 source IDs are copied from the actual draft commit above, explicitly unapproved; other rows await their real contracts. Record manual checks separately from automated counts. Preserve failures/skips, inspect assertions and do not substitute zero tests, mocked persistence or a generic AI PASS statement.

Two excerpt candidates for Part F, conditional on real implementation:

| Required excerpt | Candidate / expected proof | What to embed only after execution |
| --- | --- | --- |
| Important domain rule | F-04 once-only/atomic response, including a real concurrent duplicate or close/submit-order rule from #13/#20 | Actual fixture/setup and assertion proving durable row counts/rejection/rollback, exact file/case/test ID and tested version, observed runner output. Retain RED/GREEN when that rule was developed. No invented snippet. |
| Role/ownership restriction | F-03 direct wrong-owner or respondent management rejection from #12/#19, with real sessions/DB | Actual setup for distinct identities/resources, direct API status/projection/no-mutation assertion, exact file/case/AC/test/version and execution. Shared guard harness alone is insufficient. |

If another actual test better demonstrates the required category, document the selected real alternative and its traceability. Do not silently replace a missing domain test with a documentation test. Commands and counts must be those actually run; report Not run until tooling/results exist. No coverage percentage is required or asserted by this plan.

## 5. Process, release and safe reproduction

Sample two **completed** implementation Issues/PRs only when their actual review/integration exists. For each record Issue, feature/contract/AC, feature branch from staging, actual author/opposite reviewer, a concrete review check/question/finding/reason, fix/recheck as needed, staging integration SHA and inclusion in the reviewed main release. Documentation PRs #27/#28/#29 record planning history; their opening or merge is not completed application implementation or a substitute for Part F. Do not close an umbrella to create an artificial completed sample.

Record the real contract/test-design -> RED -> implementation/GREEN -> review -> integration -> release sequence with dates/SHAs when available. One reviewed release PR from integrated staging to main supplies the actual release reference. Record actual accepted main tag/SHA and required build/tests on that version; feature-branch checks alone are insufficient. Later fixes must not silently replace the submitted version. No merge/review/release is performed by this plan.

Keep root README current once commands/configuration exist. Part F setup summary must cover actual Node/package/PostgreSQL prerequisites, one lockfile, environment-variable names/examples, test/dev DB separation, explicit migrations/seed, run/build/typecheck/test commands, ports/origin, startup/shutdown/restart and limitations. Safe synthetic accounts are supplied through local seed procedure/private course handoff. Do not put real passwords, tokens, connection secrets or production credentials in Git/PDF; do not invent student IDs/names for the cover.

## 6. Review/assembly handoff

#6 is ready for human plan review when these three files cover its checklist, links/structure/source claims are checked and missing future content is clearly pending. Actual approval and reviewed integration still need the teammate. #26 owns executing/assembling EV-S1-01-12, replacing pending rows truthfully, updating traceability from accepted contracts, and PDF visual/content audit. Use the [outline](report-outline.md) for A-F order and actual navigation at assembly time. This source is a plan, not the final assessed PDF or evidence of completed S1.
