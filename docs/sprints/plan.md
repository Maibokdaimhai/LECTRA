# LECTRA — Three-Sprint Plan

Version: 0.2 (2026-11-06). Status: revised planning draft for team review.
Related issue: [#4](https://github.com/Maibokdaimhai/LECTRA/issues/4).
References: [SRS](../srs.md), [features](../features.md), [traceability](../traceability.md), [SDS](../system-sds.md).

## 1. Dates and planning authority

The instructor's dates below come from the two supplied PDFs. Proposed internal dates are team planning choices. Use the course's stated 23:59 deadlines and Asia/Bangkok for team scheduling, subject to any later course announcement.

| Checkpoint | Instructor deadline | Required outcome |
| --- | --- | --- |
| Deliverable 1 | 8 Nov 2026, 23:59 | Whole-product baseline + engineered working Sprint 1 on main; one self-contained PDF with Parts A–F. |
| Lab 5 | 15 Nov 2026, 23:59 | Docker, enforced CI quality gate, durable GCP deployment and repeatable delivery. |
| Lab 6 | 22 Nov 2026, 23:59 | Independent cross-team UAT, legitimate defect handling and independent re-test. |
| Deliverable 2 / Lab 7 | 29 Nov 2026, 23:59 | Sprint 2 complete, Sprint 3 contracts AND implemented progress; approved maintenance/change evidence. |
| Final | 13 Dec 2026, 23:59 | Completed Sprint 3/full product, verified release and required final submission/demo. |

## 2. Sprint 1 — Working lecture feedback loop

Proposed window: 6–8 Nov. Goal: one complete, persisted, authorized identified-survey journey.

Included features: F-01 authentication/access, F-02 seeded Course/Section/Lecture context/discovery, F-03 Draft/publish/close, F-04 validated one-time identified response/status/readback, F-05 aggregate/text results under the visibility policy. Establish SYS-01–04 foundations. Explicit Course/Section entities replace ambiguous Classroom naming; they do not introduce administration UI.

Dependencies: accepted product scope/requirements, selected stack and System SDS, and a reviewed/versioned contract with AC/STS/DoD for each feature before its implementation. Contracts may be elaborated one feature at a time after the whole-product baseline is agreed; Sprint 2/3 screen/API detail need not be frozen now.

Suggested internal sequence:

1. 6 Nov: review Issues #1–#4 drafts, resolve immediate gates, then prepare Issue #5 contracts before coding. Issue #6 plans evidence collection in parallel.
2. 6–7 Nov: implement bounded feature branches from `staging` under separate authorized implementation Issues, meaningful TDD, teammate PR review and integration. Start with F-01/F-02, then F-03/F-04, then F-05.
3. 8 Nov: reserve time for integrated build/test, selected UI journeys, persisted retrieval/restart checks, reviewed release to main, release reference, PDF assembly and verification. Do not defer all review/evidence to the final hour.

Completion outcome:

- Owner logs in, creates/publishes a small identified survey for an owned lecture; eligible student logs in, submits once and reopens the saved outcome; owner closes and sees correct results.
- Invalid login, unauthenticated/forbidden/cross-user access, bad answers, duplicates/concurrency and Draft/Closed submissions are verified with appropriate automated coverage.
- Required build/tests are run against the submitted release; actual files/test names, commands, counts and commit are retained. Meaningful TDD evidence exists for selected important rules.
- Accepted main release, setup instructions, reviewed Issues/PRs, contribution and complete Parts A–F PDF exist. No fabricated approval, test or execution evidence.

Scope exclusions for Sprint 1: anonymous submissions, Starter Questionnaire, single-choice, subset-selection UI, survey-copy workflow, export, history/trends, Teaching Improvement Notes, scheduling and management CRUD. These are either later-sprint baseline or explicit exclusions, as recorded in the SRS.

## 3. Sprint 2 — Privacy and bounded core expansion

Proposed window: 9–22 Nov, leaving 23–29 Nov for Sprint 3 working progress and Lab 7. Instructor requirement: Sprint 2 complete by 29 Nov.

Included: F-06 anonymous mode, F-07 versioned Starter Questionnaire with independent Draft copies plus single-choice/copy/subset controls, F-08 aggregate CSV export. Continue release/testing/docs responsibilities. Detailed anonymous contract and privacy review precede implementation; frontend omission of names is insufficient.

Dependencies: accepted Sprint 1 increment, reviewed feature contracts, anonymous threat-boundary resolution, existing lifecycle/eligibility/aggregation. F-07/F-08 must preserve identified behavior and anonymous protections. Work on Lab 5 delivery proceeds alongside bounded features, not as a substitute for them.

Completion outcome: integrated identified/anonymous workflows, one-time participation without an owner-visible answer join, threshold-controlled results/export, seeded four-category starter preview/copy/customization, immutable source versions, single-choice summaries, tested eligibility subsets and copy isolation, reviewed release with updated traceability. Metric provenance is recorded before S3 comparisons; no retroactive grouping of custom S1 questions by title.

Proposed work order: resolve F-06 privacy contract early; implement F-07's copy boundary/version seed alongside the existing editor; integrate extra question/subset validation; have F-08 consume the same guarded result projection. F-06 and F-07 can proceed independently after their contracts but require a combined regression before release. Do not serialize all expansion behind CSV export or add a separate template application service/microservice.

Lab 5, due 15 Nov: containerize the accepted increment, demonstrate persistence after redeploy, enforce PR gates including a controlled failing check on an isolated branch, and establish repeatable main deployment. No deliberate breakage of the accepted release.

Lab 6, due 22 Nov: arrange a partner team early. Prepare at least four user-facing UAT cases covering normal, rule/boundary, role/ownership and state/persistence behavior against a recorded release. Record actual findings, triage, regression fix/review/deploy and independent re-test of at least one legitimate accepted defect. If none is found, request the TA's controlled exercise; never invent one.

## 4. Sprint 3 — History, integration and final verification

Proposed window: 23 Nov–13 Dec; plan around the 1–11 Dec exam period.

Included: F-09 owned Course/Section/lecture history/filtering and compatible-question trends; F-10 owner-private Teaching Improvement Notes; final integration, failure handling, usability, privacy/security regression, performance verification, unresolved defect correction and final evidence under SYS-01–04.

Dependencies: integrated Sprint 2, reviewed F-09 contract defining comparability and F-10 contract defining visibility/status/revision behavior, UAT/defect status and repeatable deployed release. F-09 and F-10 can proceed in separate bounded branches; notes depend on available Closed results, not the trend UI.

By 29 Nov: show Sprint 3 contracts, implemented working history/filtering progress and a bounded private-note create/read flow integrated with Sprint 1/2, actual verification evidence and explicit remaining work. A placeholder page or seeded note without a working authorized flow is not implemented progress. This is the team's proposed working checkpoint; the instructor requires genuine Sprint 3 progress, not this exact feature split.

F-10 outcome: owner reviews available Closed results, records issue/action in one private Planned note, edits with revision checks, marks Applied with reflection, and can deliberately return to Planned with a reason. Verify student/other-owner rejection, anonymous threshold, duplicate creation, stale edits, unchanged results and no note leakage into CSV/trends. No shared-note workflow is promised.

Lab 7, due 29 Nov: obtain instructor/TA approval for a change to existing behavior. Trace impact to requirements/design/contracts/tests/code, retain the changed-behavior failing test before correction, implement/review/redeploy, and run regression. Record five dated metrics with sources and an action-oriented interpretation plus retrospective/readiness checks. Planned baseline features alone do not satisfy this maintenance requirement.

Final outcome by 13 Dec: whole baseline implemented or honestly disclosed with approved changes; automated/regression and independent UAT re-tests recorded; deployed release tied to commit; updated traceability, reproducible setup, final report and required video with both students. Use the exam period for bounded remaining work, not unplanned major features.

## 5. Two-person work and review allocation

Actual student names, IDs and assignments remain pending team input. The following is a rotation proposal, not a contribution record or evidence that either person has done the work.

| Work package | Proposed implementer/author | Proposed reviewer | Shared responsibility |
| --- | --- | --- | --- |
| Requirements/access/session contract + F-01 | Student A | Student B | Both explain identity/access and tests. |
| Context/survey contract + F-02/F-03 | Student B | Student A | Both review data/ownership/state rules. |
| Response contract + F-04 | Student A | Student B | Pair on duplicate and close/submit concurrency. |
| Results contract + F-05 | Student B | Student A | Both verify denominators/text privacy and evidence. |
| S2 starter/copy contract + F-07 | Student A | Student B | Both verify source versions, copied IDs and historical isolation. |
| S2 anonymous + F-06 | Student B | Student A | Pair on threat boundary, identity/answer separation and suppression regressions. |
| S2 CSV + F-08 | Rotate after first S2 integration | Other student | Review safe export, ownership and shared result policy. |
| S3 F-09 trends / F-10 notes | Split lead features, reverse earlier reviewer roles | Other student | Both explain comparability, privacy, revision conflicts and UI behavior. |
| Sprint 2/3 and Labs 5–7 | Rotate lead ownership per bounded Issue | Other student | Both participate in design, code, tests, AI supervision, delivery and maintenance. |

Each author prepares/updates contracts and tests as well as code. The teammate provides substantive review, not self-approval or an AI substitute. Identify actual pair work in Issues/PRs. Equal commit counts are not required; understanding and meaningful participation are.

## 6. Git, evidence and implementation gates

`Issue → feature/fix branch from staging → teammate-reviewed PR into staging → integration/system tests → reviewed staging-to-main release PR → recorded tag/commit → deployment after Lab 5`.

The initial `main` baseline is the empty README commit `a0af019`. These documents are prepared on `docs/1-4-product-baseline`, branched from `staging`. The project owner authorized committing/pushing this documentation and opening its PR into `staging` on 2026-11-06. That authorization does not include merge or implementation. Use Conventional Commits and no `codex/` branch prefix; further actions require authorization within their scope. A branch or PR alone is not evidence of teammate review or an accepted release.

Before coding a feature: accept the applicable baseline, resolve blocking decisions, record/version its feature contract and STS, then begin rule TDD. Do not backfill the preimplementation history. Issue #6's evidence outline may proceed in parallel; completing that plan is not completing Part F.

## 7. Risks and contingencies

| Risk | Response |
| --- | --- |
| Very short Sprint 1 window | Keep seeded setup, two question types and manual close; reserve integration/review/PDF time. Do not silently drop auth, persistence, tests or teammate review. |
| Unreviewed drafts or missing commit permission | Keep status honest; request the concrete document/version-history action before starting implementation dependent on it. |
| Anonymous complexity | Elaborate/review privacy early; implement in S2. Do not enable an unverified anonymous label or postpone all design to S3. |
| Product extensions increase S2/S3 workload | Keep one seeded starter and private single-note workflow; no template admin, shared publishing, discussion or AI. Review actual capacity before contracts; any approved reduction/reallocation is recorded, not silently dropped. |
| Misleading course/instructor analytics | Scope to owned Sections, compatible metrics and per-lecture counts; no ranking, unlabelled pooling or suppressed-data inference. |
| Note privacy or concurrent updates | Reuse Closed-results guards; private default; unique survey note, revision precondition and atomic status history. |
| Stack version incompatibility | Pin compatible versions and verify migrations/session/hash/runtime behavior before coding against specific APIs. |
| Lab work overlaps sprint features | Track delivery/UAT/maintenance evidence separately while using the same evolving application/repository. |
| Partner UAT delays or no legitimate defect | Arrange early; report access/delay issues promptly and request TA guidance/exercise where applicable. |
| Scope or deadline changes | Record decision, impact, requirement/feature/sprint changes and approval where necessary. Ask TA before replacing the required domain slice. |

## 8. Review and execution status

All planned application work is unimplemented; no application build/test/UAT/deployment or teammate approval is claimed. Draft documentation for Issues #1–#4 is subject to review. Issues are not closed by drafting these files. See [open decisions](../decisions.md), [traceability gaps](../traceability.md) and the [baseline review](../baseline-review.md).

## 9. Baseline allocation and risk priorities

| Product outcome | Required feature allocation | Why this is bounded |
| --- | --- | --- |
| Small identified lecture-feedback slice | S1 F-01–05 plus SYS foundations. | Seeded context, two types, manual transitions; no starter/note/anonymous UI. |
| Theme-required privacy and export expansion | S2 F-06/F-08. | Shared result policy and aggregate CSV only; no identity/raw/PDF export. |
| Owner-requested starter and question reuse | S2 F-07. | One immutable seeded questionnaire; existing editor; no arbitrary template lifecycle UI. |
| Owned lecture understanding | S3 F-09. | Compatible per-lecture ratings; no university dashboard, ranking or new scoring model. |
| Owner-requested teaching action record | S3 F-10. | One private note in existing results; no shared publication, discussion or automation. |

No actual availability estimate has been supplied by either student; these windows are planning targets rather than validated capacity. Before accepting implementation Issues, record each student's available sessions and small task estimates, reserve time for the other student's review, and reduce speculative work before mandatory verification. If baseline work no longer fits, record a proposed scope/sprint change with impact and seek instructor agreement when required; do not mark unfinished work complete.

## 10. Preimplementation and release gates

| Gate | Required material | Current planning status |
| --- | --- | --- |
| Product direction | SRS, feature inventory/traceability, System SDS and feasible three-sprint allocation reviewed by both students. | Revised draft in this PR; human review pending. |
| Feature implementation start | Feature-specific design/UI/API/data details, stable AC and STS mapping, DoD and actual version history; resolve feature-specific open decisions. | Issue #5 for S1, equivalent contracts before later features. Not supplied by this PR. |
| Feature integration | Bounded Issue, implementation/tests/diff inspection, substantive teammate-reviewed PR to staging. | No application feature implementation or review evidence yet. |
| Sprint release | Integrated checks, accepted behavior, documented setup, reviewed staging-to-main PR and immutable release reference. | Not achieved by a docs-only PR or initial README commit. |
| Deliverable 1 handoff | Complete A–E plus selected real F evidence in one readable PDF; both students, navigation pages, assessed commit, limitations and safe setup. | Future assembly/evidence work; no completed PDF claimed. |

Prepare the PDF/evidence outline while implementation proceeds so commands/versions/TDD outputs/reviews are captured when they happen. Do not wait until the final day to reconstruct or invent them. The final report must include all required Parts A–F; this PR's planning depth is not a substitute for working Sprint 1.
