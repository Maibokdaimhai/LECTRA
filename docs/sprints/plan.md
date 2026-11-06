# LECTRA — Three-Sprint Plan

Version: 0.4 (2026-11-06). Status: consolidated planning draft with Section 8 proposal dispositions; actual Sprint 1 capacity and assignments are not confirmed.
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

Completion outcome: integrated identified/anonymous workflows, one-time participation without an owner-visible answer join, no owner-facing anonymous raw text, question-level quantitative release in results/export, an explicitly agreed text collection policy, concise four-category starter preview/copy/customization, immutable versions/consistent source snapshots, choice summaries, subset controls and updated traceability. Metric provenance precedes S3 comparisons; no retroactive grouping by title.

Proposed work order: resolve F-06 privacy contract early; implement F-07's copy boundary/version seed alongside the existing editor; integrate extra question/subset validation; have F-08 consume the same guarded result projection. F-06 and F-07 can proceed independently after their contracts but require a combined regression before release. Do not serialize all expansion behind CSV export or add a separate template application service/microservice.

Lab 5, due 15 Nov: containerize the accepted increment, demonstrate persistence after redeploy, enforce PR gates including a controlled failing check on an isolated branch, and establish repeatable main deployment. No deliberate breakage of the accepted release.

Lab 6, due 22 Nov: arrange a partner team early. Prepare at least four user-facing UAT cases covering normal, rule/boundary, role/ownership and state/persistence behavior against a recorded release. Record actual findings, triage, regression fix/review/deploy and independent re-test of at least one legitimate accepted defect. If none is found, request the TA's controlled exercise; never invent one.

## 4. Sprint 3 — History, integration and final verification

Proposed window: 23 Nov–13 Dec; plan around the 1–11 Dec exam period.

Included: F-09 owned Course/Section/lecture history/filtering and compatible-question trends; F-10 owner-private Teaching Improvement Notes; final integration, failure handling, usability, privacy/security regression, performance verification, unresolved defect correction and final evidence under SYS-01–04.

Dependencies: integrated Sprint 2, reviewed F-09 contract defining comparability and F-10 contract defining visibility/status/revision behavior, UAT/defect status and repeatable deployed release. F-09 and F-10 can proceed in separate bounded branches; notes depend on available Closed results, not the trend UI.

By 29 Nov: show Sprint 3 contracts, implemented working history/filtering progress and a bounded private-note create/read flow integrated with Sprint 1/2, actual verification evidence and explicit remaining work. A placeholder page or seeded note without a working authorized flow is not implemented progress. This is the team's proposed working checkpoint; the instructor requires genuine Sprint 3 progress, not this exact feature split.

F-10 outcome: owner records issue/action in one private note on an accessible Closed survey, edits with revision protection and selects Planned/Applied without a reflection, reversal reason or detailed history. Retain essential timestamps only. Verify ownership/result-access guards, unique create, stale edits, unchanged results and no note leakage into CSV/analytics. No shared-note workflow is promised.

Lab 7, due 29 Nov: obtain instructor/TA approval for a change to existing behavior. Trace impact to requirements/design/contracts/tests/code, retain the changed-behavior failing test before correction, implement/review/redeploy, and run regression. Record five dated metrics with sources and an action-oriented interpretation plus retrospective/readiness checks. Planned baseline features alone do not satisfy this maintenance requirement.

Final outcome by 13 Dec: whole baseline implemented or honestly disclosed with approved changes; automated/regression and independent UAT re-tests recorded; deployed release tied to commit; updated traceability, reproducible setup, final report and required video with both students. Use the exam period for bounded remaining work, not unplanned major features.

## 5. Two-person work and review allocation

Actual student names, IDs and assignments remain pending team input. The following is a rotation proposal, not a contribution record or evidence that either person has done the work.

BASE-01 is a review finding about feasibility, not a new instructor requirement to collect private schedules. Following the owner's clarification, keep this planning lightweight: names/private academic calendars are not prerequisites for reviewing the product baseline. Do not invent actual availability or pretend that equal task counts imply equal effort. Confirm concrete implementer/reviewer availability and bounded tasks in Issue #5 before calling the Sprint 1 implementation plan final.

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

Coarse effort model, for discussion rather than a commitment or actual time record:

| Work group | Complexity | Illustrative focused person-hours | Allocation / dependency |
| --- | --- | --- | --- |
| Setup/database seed plus F-01 identity/session/access | High | 8–14 | Proposed A leads identity, B reviews; shared foundation first. |
| F-02 context plus F-03 Draft/publish/close | High | 10–16 | Proposed B leads; depends on foundation and identity for runtime checks. |
| F-04 validation/persistence/concurrency | High | 8–12 | Proposed A leads, pair on races; needs published survey rules. |
| F-05 results and scale-labelled UI | Medium | 4–6 | Proposed B leads; needs answer fixtures and results/access rules. |
| S1 contracts, cross-feature E2E/integration, teammate review/fixes, release and PDF evidence | High / shared | 10–16 | Both; feature estimates include their local rule/API tests, while this row covers shared checks/docs/review. |

The illustrative base totals 40–64 person-hours; a 20% uncertainty reserve gives roughly 48–77 person-hours, not elapsed hours or claimed available capacity. Actual remaining effort, skill/reuse and team availability are unknown. Re-estimate small tasks in Issue #5; do not present 6–8 Nov as proven feasible based on this model. Reserve the last scheduled work block for integration/review/release/PDF and keep buffer available rather than allocating every hour to coding. If the team's capacity cannot support the scope, escalate the delivery risk and record agreed adjustments; mandatory auth/persistence/access/testing cannot be silently removed.

Critical path: shared setup/schema → F-01/F-02 → F-03 publish lifecycle → F-04 response transaction → F-05 integrated results → system checks/review → release/PDF. Contracts and safe seed work can proceed alongside each other; reviews need the other person's available time and cannot be assumed instantaneous. This addresses planning structure only, not actual capacity confirmation.

## 6. Git, evidence and implementation gates

`Issue → feature/fix branch from staging → teammate-reviewed PR into staging → integration/system tests → reviewed staging-to-main release PR → recorded tag/commit → deployment after Lab 5`.

The initial baseline is README commit `a0af019`; planning work uses `docs/1-4-product-baseline` and PR #7 into `staging`. By default the two team members manage Git operations, commits, branches and PRs themselves. The owner subsequently renewed explicit permission for the assistant to commit/push this consolidated documentation on the existing branch only; merge and substantive teammate review remain with the team. Conventional Commits/no-`codex/` still applies. A branch or PR is not proof of teammate approval or accepted release.

Before coding a feature: accept the applicable baseline, resolve blocking decisions, record/version its feature contract and STS, then begin rule TDD. Do not backfill the preimplementation history. Issue #6's evidence outline may proceed in parallel; completing that plan is not completing Part F.

## 7. Risks and contingencies

| Risk | Response |
| --- | --- |
| Very short Sprint 1 window | Keep seeded setup, two question types and manual close; reserve integration/review/PDF time. Do not silently drop auth, persistence, tests or teammate review. |
| Unreviewed drafts or missing commit permission | Keep status honest; request the concrete document/version-history action before starting implementation dependent on it. |
| Anonymous complexity | Elaborate/review privacy early; implement in S2. Do not enable an unverified anonymous label or postpone all design to S3. |
| Product extensions increase S2/S3 workload | Keep one seeded starter and private single-note workflow; no template admin, shared publishing, discussion or AI. Review actual capacity before contracts; any approved reduction/reallocation is recorded, not silently dropped. |
| Misleading course/instructor analytics | Scope to owned Sections, compatible metrics and per-lecture counts; no ranking, unlabelled pooling or suppressed-data inference. |
| Note privacy or concurrent updates | Reuse result-access guards; private default; unique survey note and atomic revision/essential timestamp update, without detailed history. |
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

No actual availability estimate has been supplied by either student; these windows remain targets rather than validated capacity. The owner requested a proportionate approach, so detailed allocation/availability and task estimates are a preimplementation Issue #5 follow-up rather than a request for personal schedules in this PR. Retain review/integration buffer and record any scope/sprint impact; do not mark capacity as confirmed or silently drop mandatory verification.

## 10. Preimplementation and release gates

| Gate | Required material | Current planning status |
| --- | --- | --- |
| Product direction | SRS, feature inventory/traceability, System SDS and feasible three-sprint allocation reviewed by both students. | Revised draft in this PR; human review pending. |
| Feature implementation start | Feature-specific design/UI/API/data details, stable AC and STS mapping, DoD and actual version history; resolve feature-specific open decisions. | Issue #5 for S1, equivalent contracts before later features. Not supplied by this PR. |
| Feature integration | Bounded Issue, implementation/tests/diff inspection, substantive teammate-reviewed PR to staging. | No application feature implementation or review evidence yet. |
| Sprint release | Integrated checks, accepted behavior, documented setup, reviewed staging-to-main PR and immutable release reference. | Not achieved by a docs-only PR or initial README commit. |
| Deliverable 1 handoff | Complete A–E plus selected real F evidence in one readable PDF; both students, navigation pages, assessed commit, limitations and safe setup. | Future assembly/evidence work; no completed PDF claimed. |

BASE-03/04/06 handoff to Issue #5: finalize encoded/decoded F-04 limits, distinguish F-02 context APIs from F-09 search, and freeze/store/return F-03/F-05 scale labels and interpretation. BASE-02/05/07 detailed privacy/collection, copy snapshot and starter verification precedes the corresponding Sprint 2 implementation. BASE-08 detailed simplified-note contracts precede F-10/Sprint 3. Section 8 Innovation Opportunities P10/P05/P14/P15 now have individual dispositions in the review register; they are not four formal Suggestions. Full source verification remains OPEN-11, and the separate Initial Review item REV-08 is reflected by these explicit pre-contract handoffs.

Prepare the PDF/evidence outline while implementation proceeds so commands/versions/TDD outputs/reviews are captured when they happen. Do not wait until the final day to reconstruct or invent them. The final report must include all required Parts A–F; this PR's planning depth is not a substitute for working Sprint 1.

## 11. P15 — Bounded feedback-cycle usability evaluation

Selected disposition: Incorporate into existing SYS-04/Sprint 3 QA, not a new feature, instructor mandate or Sprint 1 task. Source is the owner's summary of Section 8 in the teammate's Comprehensive Review; the full report has not been accessed directly. P10/P05 remain in their existing bounded features; P14 remains simplified/private with sharing deferred.

Purpose: evaluate whether an instructor can use Closed feedback to identify a concrete teaching action, and whether a student understands eligibility, one-time submission and the implemented privacy policy. This complements technical/accessibility verification and independent UAT rather than replacing either.

Scope proposal: aim for one or two participants per role (two to four short sessions total), using synthetic data and the actual implemented release. Role-representative participants are preferred; if only proxies are available, record that limitation. Plan approximately 15–20 minutes per session plus one short synthesis block; these are planning targets, not claimed participation or measured effort. Confirm feasibility during S3 planning rather than expanding the baseline into a research platform.

| Role / task | Observation to record | Interpretation boundary |
| --- | --- | --- |
| Instructor inspects an accessible Closed survey and identifies one useful next-lecture action. | Whether an action is identified, which permitted result supports it, time to identify it, assistance needed and misinterpretations. | Useful action is a qualitative observation, not proof of improved teaching outcomes or a validated evaluation instrument. |
| Instructor records that action in the private note, if F-10 is implemented. | Task completion/confusion, issue/action distinction and understanding of private visibility/status. | Do not test or claim a sharing workflow that is outside scope; do not use raw anonymous text. |
| Student discovers an eligible survey and explains participation. | Correct understanding of eligibility, once-only submission and closed-survey behavior; help needed. | Do not turn participation into attendance/grade measurement. |
| Student explains what an owner can see in identified versus anonymous mode. | Correct/incorrect statements about identity linkage, raw text and suppressed quantitative data; unclear disclosure wording. | Run only against the actual agreed/implemented anonymous collection policy; do not imply perfect anonymity. |

Record session ID, actual participant role/proxy status, synthetic scenario, release commit, task, observed result, time where measured, assistance, comprehension notes and resulting Issue/action. Report counts with actual denominators and disclose recruitment limitations; do not invent sessions, transcripts or statistical confidence. Keep feedback records minimal and non-identifying where practical.

Use findings to improve copy/layout or create a bounded defect/enhancement with normal traceability and review; recheck affected tasks after a fix. Existing NFR-07 and FR-07/FR-14 user goals provide context, but this small exploratory study does not create a new numeric NFR or release threshold. Lab 6's required four UAT cases, independent execution and legitimate defect/re-test evidence remain separate; do not substitute these sessions for mandatory lab evidence or claim that an early S1 UAT tested unimplemented S3 notes.
