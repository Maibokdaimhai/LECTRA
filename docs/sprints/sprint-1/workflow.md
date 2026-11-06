# Sprint 1 — Board, Teammate Review and Release Workflow

Related issue: [#9](https://github.com/Maibokdaimhai/LECTRA/issues/9). Status: documentation draft with observed Kanban configuration and teammate Write access configured; actual teammate use and human review/integration remain unverified.

## 1. Scope and observed facts

- The owner authorized continuing on the existing [LECTRA Kanban](https://github.com/users/Maibokdaimhai/projects/7) after logging in. The existing board, columns and 25 issue cards were inspected through GitHub UI on 2026-11-06 (Asia/Bangkok); 21 are the Sprint 1 set and #1–#4 are pre-existing Done cards. No duplicate board/columns were created.
- The [Sprint 1 milestone](https://github.com/Maibokdaimhai/LECTRA/milestone/1) and [tracker #8](https://github.com/Maibokdaimhai/LECTRA/issues/8) provide the issue set and allocation. All #5, #6 and #8–#26 were visibly present, with the existing assignees retained. State/assignee observations are snapshots, not proof of runtime or review completion.
- PR [#27](https://github.com/Maibokdaimhai/LECTRA/pull/27) is a separate tracker setup change awaiting review at inspection. It is not a completed Sprint 1 or permission to merge other work.
- This workflow draft uses branch `docs/9-sprint1-review-workflow` from `staging` baseline `333a9fc6a6a2905b07087c98eb5f5d931ffec107`. It does not include the unmerged PR #27 branch.
- Actual participants are GitHub users `Maibokdaimhai` and `R1NNE0`. Current assignments establish issue leads, not completed contributions or available hours. Both participate in design, implementation, tests and review.

The assignment requires Issues/board, feature/fix branches from sprint staging, substantive teammate review, integrated verification and a reviewed release to main. Specific board labels, branch names and template fields below are team conventions, not additional instructor requirements. See [System SDS](../../system-sds.md), [sprint plan](../plan.md) and [decision log](../../decisions.md).

## 2. Existing Kanban states and verified setup

Reuse the existing six Status values; do not add spelling-equivalent duplicates. Specified maps to planning-ready scope and Started maps to in-progress work. A contract-writing task can have a clear specification before its output contract is written; moving it to Specified does not certify that the feature contract exists.

| Existing state | Entry condition | Exit / evidence rule |
| --- | --- | --- |
| Backlog | Work is not selected or has unmet contract/foundation dependencies. | Move to Specified only when the bounded task can genuinely start; list remaining dependencies. |
| Specified | Scope/input/lead is clear enough to begin the task. | Move to Started when actual work begins, not merely because assigned. Feature-code readiness still requires its recorded contract. |
| Started | Actual bounded work is underway; includes an umbrella actively tracking a still-incomplete increment. | Move a bounded review-ready package to PR Review; do not move an entire delivery umbrella because one partial PR exists. |
| PR Review | A concrete PR/artifact and actual validation are ready for the opposite-member review. | Address findings in Fixing; Done still requires the applicable review/integration/DoD. |
| Fixing | Actual review findings or a real defect are being corrected. | Re-run affected checks and obtain re-review; no fabricated finding or approval. |
| Done | The full bounded issue acceptance/review/integration boundary is evidenced. | The existing auto-close rule closes the Issue when this status is set; do not use it as a cosmetic completion label. |

Verified board arrangement after the authorized status updates:

| State | Cards observed | Reason / limitation |
| --- | --- | --- |
| Backlog | #15–#26 (12 cards). | Setup needs its bounded design; database/features/tests/release/report still have prerequisites. Final execution is not claimed ready. |
| Specified | #5, #6, #10–#14 (7 cards). | Shared contracts/DoD, evidence planning and feature-contract drafting can begin from the merged baseline. No completed contract is implied. |
| Started | #8 and #9 (2 cards). | Tracker setup is under PR #27 and the broader tracker remains active; #9 documentation/board setup is actually being performed. |
| PR Review / Fixing | No cards at this snapshot. | PR #27 remains a separate actual PR; #8 is the whole delivery tracker and must not be treated as fully review-complete. |
| Done | #1–#4 (4 pre-existing cards). | Left unchanged; no new review/approval is inferred or fabricated from these cards. |

No issue was moved to Done or closed by this task, and no assignee/priority/estimate/date was invented. Record final board evidence again near the assessed release; this operational snapshot is not the final submission board.

Existing project rules inspected without modification: Auto-close issue maps Done to Issue closure; Pull request linked to issue sets Started; Pull request merged sets Done for the applicable PR item. Those rules do not override a linked umbrella's acceptance boundary. Seven workflows are enabled in the UI; no workflow was enabled/disabled here. Do not add a partial PR as a substitute for the entire tracker or assume its merge proves contract/tests/release completion.

Initial access inspection found a private project with only Maibokdaimhai listed as Admin. After the owner explicitly authorized inviting R1NNE0 with Write, the Invite action was submitted on 2026-11-06. GitHub Manage access then showed two members: Maibokdaimhai (Admin) and R1NNE0 (Write), with no pending label visible. This verifies the owner-side access configuration, not a login/use test by the teammate. Repository permissions, project visibility, authentication and approval settings were not changed.

Maintenance checklist: keep the 21 Sprint 1 cards reconciled with the milestone; update states only from actual work; attach real branch/PR/evidence links; capture the board URL/date/status/assignee view for the final report; retain the opposite member's review time. A lightweight one-primary-work-package-per-person preference is coordination guidance, not enforced capacity or equal-effort evidence.

## 3. Issue and contract readiness before code

The actual author/lead checks the issue's feature/FR/BR/NFR links, current baseline, intended change, exclusions, dependencies and planned reviewer. Under #5, agree shared Product DoD and ID conventions. Record/version each feature's design, UI/API/data details, observable AC and STS before implementing that feature.

The STS specifies test ID, linked AC, level, preconditions/input, action and expected result. Plan unit logic, real API/PostgreSQL persistence/access and selected UI/E2E checks with relevant negative/boundary/concurrency cases. Detailed F-01–F-05 contracts remain #10–#14, not silently supplied by a workflow template.

Issue leads own code and tests as well as the relevant design/documents. The opposite member reviews the bounded change. Record real pair work in the Issue/PR; no permanent documentation-only versus coding-only roles, equal-commit-count target or invented availability.

## 4. Branch and PR routing

| Change | Starting point | Suggested branch convention | PR target |
| --- | --- | --- | --- |
| Product/contract/process documentation | Current accepted `staging` | `docs/<issue>-<topic>` | `staging` |
| Bounded feature or setup implementation | Current accepted `staging`, after applicable design/contract gate | `feat/<issue>-<topic>` or `chore/<issue>-<topic>` | `staging` |
| Defect correction | Current accepted `staging` or explicitly agreed isolated defect baseline | `fix/<issue>-<topic>` | Normally `staging`; explain an exceptional baseline/route. |
| Sprint release | Integrated and verified `staging` | Existing staging branch | `main` through a separately reviewed release PR. |

Use Conventional Commits and no `codex/` prefix. Do not base #9 on unmerged PR #27 or bring its diff in by cherry-pick just to obtain a pending file. If a change truly depends on an unmerged PR, state that dependency and wait or use an explicitly agreed stack; do not accidentally include unrelated work.

Before a new branch, inspect local changes and update remote references; use the correct accepted staging baseline without resetting another person's work. Updating/rebasing an existing PR must preserve needed contract/TDD history and account for real teammate feedback; do not force-push unreviewed history as a convenience.

Creating an Issue or assigning it is not permission for an assistant to commit, push, open/merge PRs or release. Use the current human authorization for each action's scope. The owner explicitly authorized committing, pushing and opening this #9 PR; teammate review, merge and release remain separate steps.

## 5. Reviewable PR contents

Use the proposed [default PR template](../../../.github/pull_request_template.md) as a checklist/manual copy while it is being introduced. GitHub makes repository templates available after they reach the default branch; adding this file on a feature/staging branch is not proof that automatic template loading is active on the current `main`.

Each PR explains the problem/result, scope and linked Issues, feature/contract/AC references, actual source/test-design versions, changed UI/API/data layers, validation, risks/limitations and intended target. Use `Refs #8` for partial tracker setup rather than a closing keyword that suggests the whole Sprint 1 is complete. Closing links must reflect the issue's actual acceptance scope and target-branch behavior, not be used to manufacture completion.

For important rule/defect work, include the actual intended-behavior failure before implementation/correction and passing result afterward, with versions and assertions. Do not substitute a syntax/import crash unrelated to intended behavior, weaken assertions or disable required tests to produce green output.

PR validation must identify commands, working environment, tested SHA, actual file/test names and passing/failing/skipped counts. Mark a check Not run or N/A with a reason when appropriate. Documentation-only changes may use appropriate link/structure checks and explain why app tests do not apply; do not fabricate an application build/test run for a repository that has no application yet.

## 6. Substantive teammate review

The reviewer is the other member, not the PR author or an AI acting as that person. The lead's current Issue annotation identifies the planned reviewer only; it is not a submitted review request, acceptance or proof that a review occurred.

| Reviewer area | Concrete questions / observations to record |
| --- | --- |
| Requirement and scope | Does the diff implement the stated feature/AC and exclude later-sprint work? Is a changed rule reflected in the contract? |
| UI/API/data consistency | Do payload/schema/constraints agree, including frozen scale metadata and validation/error behavior? Is persistence real? |
| Permissions and failure cases | Are role/owner/eligibility/other-user checks enforced by the backend? Are negative/boundary/concurrency cases meaningful? |
| Test strength | Do assertions prove outcomes/rollback/privacy rather than mirror implementation? Are failures/skips and actual execution versions visible? |
| History and evidence | Was the applicable contract/test design recorded before code? Is meaningful TDD evidence genuine? Are contributions/pair work accurate? |
| Setup and risk | Are configuration, migration/seed/restart behavior and limitations reproducible? No real secrets or unsafe data? |

A review records a specific check, question, finding or reason for approval. Example format only: `Checked [actual scenario/file/version]; observed [actual outcome]; [finding or reason this satisfies AC].` Fill it with real observations; do not paste it as a completed review or call a generic `LGTM` substantive evidence. AI may prepare a checklist, but the student performs and owns their review.

Address review findings with bounded changes, update contracts/tests when justified, rerun affected checks and obtain re-review as needed. Preserve resolved conversations and actual approval references. A merge does not retroactively prove a substantive review existed.

## 7. Staging integration and local checks before completed CI

After real feature review/acceptance, integrate authorized PRs into `staging`. Run the agreed integration/system/selected browser checks on the integrated version; if integration fails, create/link a fix Issue/branch, preserve the failure and re-test rather than accepting a broken increment.

Before Lab 5, local commands/results tied to the actual tested commit are required evidence. This issue does not add empty CI workflows or claim build/test gates are configured. Required CI/quality-gate enforcement and repeatable Docker/GCP delivery belong to Lab 5 and are maintained afterward.

Branch protection, bypass rules, reviewer requirements, authentication and CI enforcement were not changed. The only permission change was the owner's explicitly authorized R1NNE0 Write project invitation recorded in section 2. Do not infer authorization for broader settings changes. Untested enforcement rules can prevent the intended two-person process; any later configuration needs a concrete reviewed plan and evidence that failed required checks block the normal route.

## 8. Release readiness and evidence

Issue #25 owns the accepted S1 release after feature/contract completion, actual integrated verification and reproducible setup. Prepare the reviewed staging→main release PR only with explicit authorization. One team member authors it and the other provides substantive review; shared Issue assignment does not permit self-approval.

After the authorized merge, record immutable release tag/SHA and run required build/tests on that actual accepted main version, not only the earlier feature/staging head. Retain meaningful names/files, commands, counts, failures/skips and actual tested SHA. Any later code fix requires appropriate new verification and a distinct accepted version; do not silently replace the assessed release.

| Evidence record | Minimum fields to retain |
| --- | --- |
| Contract/history | Feature/FR/BR/NFR, AC/STS IDs, document version/commit and actual preimplementation sequence. |
| Feature PR | Issue, branch, author, actual teammate reviewer, substantive review link, checks, integration commit and real pair work. |
| Verification | Level, actual file/test name, command/run, expected/observed result, pass/fail/skip counts, tested SHA and environment. |
| Board snapshot | Actual board URL, date, visible issue/status/assignee information and relation to the assessed release; no staged fake Done cards. |
| Release/report | Reviewed release PR, tag/SHA, demonstrated app version, known limitations, both students' real contribution and final report references. |

Issue #6 plans capture; #26 assembles actual evidence/PDF. Capture TDD/output/review details when they happen. Screenshots support direct evidence and readable PDF grading; no screenshot or issue count substitutes for real verification. Keep safe synthetic test access and secrets out of public artifacts.

## 9. Current completion boundary for #9

| Item | Status for this change |
| --- | --- |
| Workflow/board instructions and PR checklist | Included in this proposed change; actual publication/PR versions are recorded in #9 and its PR. Human review/integration remain pending. |
| Existing project board | Existing private LECTRA Kanban verified; all 21 S1 cards plus pre-existing #1–#4 reconciled; actual state mapping and updates recorded above. |
| Actual issue assignments | Already recorded in GitHub; proposed review pairing does not prove availability or review completion. |
| Real board updates and final board evidence | Operational updates verified through UI; recapture final board near release. No new Done/closure claimed. |
| Teammate project access | Owner-authorized Invite submitted; Manage access shows R1NNE0 (Write) and Maibokdaimhai (Admin). Actual teammate login/use remains unobserved. |
| Team agreement, review and integration | Pending actual human action; no approval or merge claimed. |
| Branch protection / CI checks | Not modified or claimed configured. |

Keep #9 Open until the teammate confirms board use and this bounded documentation/configuration change receives actual teammate review/integration. The owner-side access configuration and local document checks do not prove those remaining steps or prevent independent contract drafting.

## References

- [GitHub: About Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects): project/issue integration and views.
- [GitHub: Customizing the board layout](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/customizing-the-board-layout): column/status mapping and view behavior.
- [GitHub: Creating a pull request template](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository): supported location and default-branch availability.
