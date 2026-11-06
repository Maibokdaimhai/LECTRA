# LECTRA — Final Product Baseline Review and Approval Preparation

Date: 2026-11-06. Scope: documentation for Issues #1–#4 in PR [#7](https://github.com/Maibokdaimhai/LECTRA/pull/7). Type: AI-assisted review, not human teammate approval or software testing. After the documentation-only review, the owner explicitly authorized commit/push of this revision to the existing branch. No merge or review impersonation is authorized.

## 1. Source authority and inspection limits

The two supplied instructor PDFs remain the authority for assignment outcomes: `group_work_specs_v1.pdf` (Theme 10, common requirements, process and Labs 5–7) and `project_deliverable_1_v1.pdf` (Parts A–F and evidence). Team PD-01–PD-03 and the cool-color theme are product decisions, not new instructor mandates.

The owner supplied the final revision request listing 0 Critical, 2 Major and 6 Minor; BASE-01–BASE-08 are available in that request. A later clarification corrects the earlier label "four Suggestions": these are **Section 8: Innovation Opportunities** in the Comprehensive Product & Engineering Review, attributed to `Pasted text(20261106-090722).txt` shared in a teammate's previous ChatGPT conversation. The owner supplied the four exact proposal IDs/titles and short descriptions. The report is not confirmed to exist in the repository, and the assistant cannot access the teammate's conversation or independently verify the full original text. Evaluations below use the owner's supplied descriptions with that provenance; do not claim the original report was read or fabricate its additional wording.

The separate **Initial Documentation Review** contains one formal suggestion, **REV-08 – Record Explicit Pre-contract Dispositions**, according to the owner. It is not part of Section 8, not a fifth innovation proposal and not interchangeable with any P-ID. Earlier deferral of four unidentified items is superseded by this clarification; verification of the full source remains pending, not evaluation of four invented replacements.

Earlier public GitHub API inspection observed PR #7 open/unmerged at head `6fa1a14`, with no reviews, inline comments or conversation comments. This is historical inspection context, not a current-head or review guarantee. No Git command or PR mutation was performed during the documentation-only audit; the owner subsequently renewed scoped commit/push permission.

## 2. Consolidated product changes

- Keep Course → Section/offering → Lecture → Survey → derived Results, with Section ownership and lecture as the primary unit.
- Preserve useful Course/own-instructor evaluation through compatible per-metric summaries across owned lectures; label context, mode, weighting, observations and limitations. No universal instructor score or cross-owner ranking.
- PD-01: never expose anonymous raw text to owners on any surface. Keep collection/storage as an explicit pre-F-06 decision. Quantitative privacy operates per question, not merely per survey.
- PD-02: one private note, issue/action, Planned/Applied, essential timestamps and revision protection; remove detailed history, reversal reasons and reflection prerequisites.
- PD-03: one concise four-category starter with single-dimension rating prompts, independent editable copies and immutable source/version meaning.
- Keep F-01–F-10 and all 46 FR/BR/NFR IDs. S1 F-01–05, S2 F-06–08 and S3 F-09–10 remain unchanged in allocation.
- Preserve architecture, cool-color UI theme, real identity/access, persistence, test/TDD/review expectations and historical-data protection.

## 3. Major / Minor finding resolution matrix

Status definitions: **Baseline addressed** means an actual product/design correction is present, not merely a mention. **Contract follow-up** means detailed preparation is safely gated before its dependent implementation. **Unverified** is not a completed result. No finding is declared runtime-verified.

| Finding ID / severity | Final documentation status | Resolution and supporting evidence | Affected documents | Remaining work and safe gate |
| --- | --- | --- | --- | --- |
| BASE-01 — Major: Sprint Workload Feasibility | Planning structure addressed; actual capacity unverified. | Sprint plan §5 has complexity/illustrative effort, non-equal proposed responsibilities, critical path, shared checks/review/PDF work and 20% buffer. Owner asked for proportionate treatment; no private calendars or invented availability. | `sprints/plan.md` §2/5/9/10; `decisions.md` DEC-24, OPEN-12. | Issue #5 confirms actual implementer/reviewer and feasible bounded work before S1 implementation schedule is called final. Coarse estimates are not available hours. |
| BASE-02 — Major: Anonymous Survey Privacy | Confirmed product policy addressed; collection choice and detailed protection contract open. | FR-07/08, BR-13/15/16/19 and NFR-06 forbid raw anonymous text on UI/API/CSV/analytics. Proposed question threshold five plus nonzero-bin guard three is separate from total survey count. Hidden means/distributions/answered counts cannot leak through consumers. | `srs.md` §4/5/7; `system-sds.md` §7/13/15; `features.md` F-06/08/09; `decisions.md` PD-01/DEC-22, OPEN-04. | Team explicitly chooses text-disabled or collect-but-owner-inaccessible and finalizes privacy tests before F-06/S2; anonymous collection/publication is not enabled until then. |
| BASE-03 — Minor: Request Size Limit | Baseline direction corrected; F-04 contract follow-up. | Replace 128 KiB with proposed 256 KiB; account for 12-byte surrogate-pair escapes, 240,000-byte text bound, bounded envelope and independent decoded/count limits. Over-limit requests fail before persistence. | `srs.md` §5; `system-sds.md` §6.2; `traceability.md` BR-07; `decisions.md` DEC-23. | Issue #5 fixes envelope/parser/compression/resource limits and exact UTF-8/escaped/boundary cases before F-04 code. Not a tested server setting yet. |
| BASE-04 — Minor: Context Selection vs Historical Filtering | Responsibility split corrected; detailed S1 contracts remain. | F-02 is owned context/current-work discovery in S1; F-09 adds historical Course/Section/date/state search in S3. Reuse list/context views/APIs; analytics endpoint has a separate aggregate purpose. | `features.md` F-02/F-09; `system-sds.md` §6.1.7/6.2; `sprints/plan.md` §2/10; `traceability.md` FR-02/11. | Issue #5 finalizes F-02 request/screen boundaries; F-09 adds later filters in S3 without duplicating context endpoints. |
| BASE-05 — Minor: Concurrent Template Copy | Snapshot/version direction addressed; F-07 contract follow-up. | Exact immutable TemplateVersion, source Draft definitionRevision, lock/recheck/read/copy in one transaction, 409 on changed expected revision, fresh target IDs and no mixed source. | `srs.md` BR-17; `system-sds.md` §2/3/10; `traceability.md` BR-17; `features.md` F-07. | F-07/S2 contract specifies source mutation/retirement lock order and concurrent tests before implementation. No new template-management feature. |
| BASE-06 — Minor: Scale Interpretation | S1 storage/readback direction addressed; F-03/F-05 contract follow-up. | Question stores range, endpoint labels and scaleInterpretation with the frozen definition in S1. Answering/results use the same metadata; numeric range alone cannot certify comparability. | `system-sds.md` §2/11; `srs.md` BR-09/18 and starter scale meanings; `traceability.md` FR-07/BR-18. | Issue #5 specifies fields/payloads/validation and freeze/readback tests before F-03/F-05 code; later metric provenance is S2. |
| BASE-07 — Minor: Starter Questionnaire Wording | Single-dimension draft corrected; content/contract review scheduled. | Separate content clarity, explanation effectiveness and environment suitability; one optional suggestion prompt. Retain editable independent copies, required flags, versioning and historical consistency. | `srs.md` §5 starter table; `decisions.md` PD-03, OPEN-07; `features.md` F-07. | Human content review and F-07/S2 verification before the versioned starter is released. No claim of psychometric validation. |
| BASE-08 — Minor: Teaching Improvement Notes Complexity | Scope simplified now; F-10 contract follow-up. | FR-14/BR-20–22 and SDS remove NoteStatusChange, reflection, reversal reasons and complex transitions; retain two fields, two statuses, essential timestamps, unique survey note and revision checks. | `srs.md`; `features.md` F-10; `system-sds.md` §2/3/12; `traceability.md`; `sprints/plan.md`; `decisions.md` PD-02. | Detailed private-note contract/tests before F-10/S3. No additional history or sharing work implied. |

The matrix distinguishes actual baseline edits from future work. BASE-01 is not labelled capacity-confirmed, and BASE-02 is not labelled anonymous-mode verified. Every deferred implementation item has a preimplementation owner/gate rather than silently disappearing.

## 4. Comprehensive Review — Section 8: Innovation Opportunities

Source attribution: teammate's Comprehensive Product & Engineering Review, `Pasted text(20261106-090722).txt`, Section 8, **as identified and summarized by the owner**. These are recommendations, not instructor requirements. Decisions below are selected baseline dispositions for human review, not implementation completion or proof that the original report has been independently checked.

| Original proposal ID / title | Disposition | User / engineering value | Complexity and trade-off | Baseline mapping / next gate |
| --- | --- | --- | --- | --- |
| P10 – Categorized Starter Questions | **Keep** the existing bounded incorporation. | Reduces repeated authoring and gives a consistent starting point across content/teaching/environment/suggestions. | Moderate copy/version work is already scoped; keep one seeded editable starter, not template administration or automatic propagation. | F-07/S2; FR-13, BR-17/18, NFR-09; SRS starter table and SDS §10. Review wording/anonymous text handling before F-07. |
| P05 – Consistent Question Series | **Keep** the existing compatible-series design. | Makes comparisons across lectures interpretable and preserves historical measurement meaning. | Requires scale/version metadata and comparability tests; matching numeric ranges/titles alone are insufficient. Custom edits may lose comparison eligibility. | F-07 metric provenance/S2 and F-09/S3; FR-11, BR-18/19; SDS §11. No new feature ID or ranking. |
| P14 – "What I Will Change" Note | **Simplify** to the selected private MVP; **Defer** optional sharing. | Records an instructor's interpretation and intended action after Closed feedback without becoming a workflow system. | Low-to-moderate single-note work; sharing adds audience/redaction/publication rules and privacy risk. Keep two fields, status/timestamps/revision; no history/discussion/AI. | F-10/S3; FR-14, BR-20–22, PD-02; SDS §12. Sharing is excluded until a separate accepted privacy/scope decision. |
| P15 – Measure the Feedback Cycle | **Incorporate** a bounded usability evaluation into existing QA, not a product feature. | Checks whether results support a useful teaching action and whether students understand participation/privacy, beyond merely completing buttons. | Small facilitated sessions and analysis require recruitment/time; avoid a new research platform, statistical claims or a dashboard. Reuse synthetic data and existing UAT/QA materials where suitable. | SYS-04/S3 supporting NFR-07 and existing user goals; plan §11 and SDS §15. Record actual participants/outcomes only when run; exploratory success is not a new release threshold. |

All four have been considered individually; keeping an existing bounded implementation plan is different from automatically adding every recommendation. No additional F-ID, new FR/BR/NFR or Sprint 1 scope is introduced. Original full-text verification remains OPEN-11 because the report is in the teammate's conversation; if its wording materially differs, review these dispositions instead of retroactively claiming an exact source match.

### Separate report: Initial Documentation Review

| Original item | Disposition | Value / scope | Evidence and remaining boundary |
| --- | --- | --- | --- |
| REV-08 – Record Explicit Pre-contract Dispositions | **Incorporate** as an explicit documentation/process practice. | Records Keep/Incorporate/Simplify/Defer, rationale, affected feature/sprint and contract gate before implementation; no application feature added. | This table, the BASE register, decision log and Issue #5 handoffs make dispositions explicit. Attribution/title is owner-supplied; the complete Initial Review has not been independently retrieved. This is not teammate approval or proof of contract completion. |

## 5. Product decisions and exact locations

| Decision | Confirmed boundary | Selected detail / remaining decision | Locations |
| --- | --- | --- | --- |
| PD-01 | No anonymous raw text to owners on any surface; identity/answer separation and separate quantitative privacy required. | Text-disabled is recommended, not confirmed; collect-but-inaccessible remains alternative until explicit agreement. Working quantitative minimum is five answered per question; sparse-bin guard three needs F-06 validation. | SRS FR-07/08, BR-13/15/16/19, NFR-06, §7; SDS §7/13; DEC-19/22; OPEN-04. |
| PD-02 | Private one-note F-10/S3, issue/action, Planned/Applied, essential timestamps and revision. | Default Planned and current-state appliedAt semantics are selected design details; detailed history/reversal/reflection/sharing removed. | SRS FR-14/BR-20–22; SDS §2/12; F-10 inventory; DEC-20; OPEN-08. |
| PD-03 | One starter F-07/S2, four categories, single-dimension ratings and independent versioned customization. | Working wording/anchors are in SRS; anonymous text treatment remains tied to OPEN-04, not a silent template mutation. | SRS starter table/BR-17/18; SDS §10/11; F-07; DEC-21; OPEN-07. |

## 6. Assignment coverage and current PR scope

| Part | Current coverage | Remaining assessed work |
| --- | --- | --- |
| A | Vision/actors/scope, glossary, 14 FR, 23 BR, 9 NFR, privacy and decision gates. | Real teammate review and accepted decisions; no score or approval is inferred. |
| B | Ten features/four system responsibilities; all 46 requirements allocated to sprints and planned verification. | Actual AC/test IDs/files/results/versions added after contracts/execution. |
| C | System architecture, data, ownership, sessions, UI/theme/API direction, version/copy/scale/privacy/notes and delivery design. | Compatible versions and feature contracts; later actual delivery evidence. |
| D | Same three-sprint allocation, dependencies/critical path, coarse effort/buffer, lab overlap and proposed shared responsibilities. | Issue #5 actual capacity/tasks before final S1 implementation commitments. |
| E | Contract handoff areas and gates only; not complete in this PR. | Issue #5: S1 feature design, API/database/UI specs, AC, STS, security/validation tests, Product DoD and detailed allocation before code. |
| F | Evidence obligations acknowledged; no application evidence supplied. | Working UI/API/PostgreSQL increment, real build/tests/TDD/demo, substantive human review/integration, accepted main release, contribution and complete self-contained PDF. |

Instructor theme requirements remain: identified S1 plus later documented/tested anonymous mode, eligibility, question/lifecycle/duplicate rules, aggregate analysis/export, real auth/access, persistence and engineering evidence. Course/own-instructor summaries are meaningful contextual feedback evaluation, not a complete instructor-quality claim or ranking. No AI/discussion/integration/template-admin scope is introduced.

## 7. Cross-document verification of this revision

Observed local checks on 2026-11-06:

| Check | Observed documentation result | Limit |
| --- | --- | --- |
| English text, relative links, whitespace, code fences and table structure | Passed across all eight Markdown files. | Source checks only, not rendered UI or human review. |
| Requirement/feature traceability | Passed: 14 FR, 23 BR, 9 NFR defined/mapped once; 10 features and four system responsibilities resolve; all requirement rows have sprint/verification allocation. | Planned coverage, not 46 executed tests. |
| Cross-document consolidation | Passed checks for BASE-01–08/PD-01–03, stable requirements/features, retained theme, four individual P10/P05/P14/P15 rows and separate REV-08. The proposal mappings and bounded P15 QA plan are consistent across affected documents. | Source attribution uses the owner's descriptions; no direct access to the teammate's complete reports is claimed. |
| Markdown parser | Passed: eight Markdown files, 51 structurally consistent tables and two Mermaid source blocks. | Diagram rendering not performed. |
| Request-size arithmetic | Ten 2,000-emoji answers serialized to 80,663 UTF-8 bytes or 240,663 ASCII-escaped bytes; proposed 256 KiB ceiling is 262,144 bytes, with the conservative envelope budget separately bounded. | Serialization sanity calculation, not an HTTP acceptance test or proof of final parser configuration. |

Checks read the local files and parse Markdown; no Git command, commit, branch, push, PR update or review submission is involved. The initial source-level/encoding checks are observations, not application build/test evidence.

No runtime/unit/API/database/E2E/privacy/load/migration test has run because no application exists. Documentation checks are not software verification. Mermaid source is present; rendered diagram layout remains unverified because the bundled runtime lacks a Mermaid renderer.

## 8. Open decisions, deferral safety and target stage

| Work | Owner / target | Why safe to defer from this baseline |
| --- | --- | --- |
| Real bounded task/reviewer allocation and capacity confirmation | Both students, Issue #5 before final S1 implementation commitments. | Model is explicitly provisional; no fictitious availability or final feasibility claim. |
| Detailed payload/parser/encoding/resource and F-02 context / rating-scale contracts | S1 feature owners + teammate, Issue #5 before F-02–05 code. | Required direction is fixed here; no implementation starts without the detailed contract. |
| Anonymous text collection/storage choice and privacy adversarial tests | Both students, before F-06/S2 code/enabling. | Raw-text non-exposure is fixed; anonymous collection/publication remains gated until the choice and controls are agreed. |
| Copy source revision/retirement concurrency and starter content verification | F-07 owner + teammate, S2 before implementation. | Independent immutable/versioned snapshot direction is fixed; no starter workflow is represented as live. |
| Simple note payload/status/timestamp/revision tests | F-10 owner + teammate, S3 before implementation. | Two-field/private scope is fixed; removed history/workflow is not carried as hidden work. |
| Original Comprehensive / Initial Review full-text verification | Team/teammate when source is shared; OPEN-11. | Proposal IDs/descriptions and separate REV-08 are owner-supplied and individually dispositioned; full-source verification is not falsely claimed. No instructor requirement depends on an invented source. |
| P15 small usability sessions | Both students, existing SYS-04/S3 QA. | No new S1 feature or infrastructure; protocol/participants and actual observations are recorded only when available. See plan §11. |
| Human review, version pinning, GCP guidance and Lab 7 approved change | Appropriate owners/gates in OPEN-01–12. | Review remains real; resources/approval not invented; timing matches relevant implementation/lab. |

## 9. Final readiness assessment

**Revised local baseline: Ready for Approval with Explicitly Documented Deferred Work.** This is an AI recommendation for human planning review, not the team's actual approval. BASE-01 remains capacity-unverified and the anonymous collection choice remains open at its explicit S2 gate; those limits must be accepted as documented, not silently marked resolved.

The owner authorized publishing this final revision on the existing PR branch after the earlier `6fa1a14` inspection. The team must inspect the resulting diff, provide substantive teammate review and accept the listed deferrals before approval. Publication does not imply merge, human approval or runtime verification. No further full rewrite is recommended; proceed through that review and the named stage-specific follow-ups, then Issue #5.
