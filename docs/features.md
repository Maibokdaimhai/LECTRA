# LECTRA — Feature Inventory

Version: 0.4 (2026-11-06). Status: consolidated planning draft with individually dispositioned review recommendations. Related issue: [#2](https://github.com/Maibokdaimhai/LECTRA/issues/2).
Source requirements: [SRS](srs.md). All features are planned, not implemented or verified.

| ID | Feature / outcome | Requirement links | Dependencies | Sprint |
| --- | --- | --- | --- | --- |
| F-01 | Authentication and access foundation: login/logout/me, database-backed sessions, backend role/record guards. | FR-01; BR-01–02; NFR-01 | Seeded identity and database setup under SYS-01 | 1 |
| F-02 | Seeded Course/Section/Lecture selection and role-appropriate current-work/eligible survey lists; no historical date/state search. Shared Course never implies shared owner access. | FR-02, FR-12; BR-02–04, BR-23 | SYS-01 supplies identities/context first; F-01 supplies authenticated discovery | 1 |
| F-03 | Survey authoring/lifecycle: rating/text Draft creation/edit/delete, validation, publish with eligibility snapshot, manual close and structural locking. | FR-03–04; BR-02–05, BR-07, BR-09–11, BR-14, BR-23 | F-01, F-02 | 1 |
| F-04 | Identified response submission and retrieval: atomic validated submission, duplicate prevention, confirmation/status and own-answer retrieval. | FR-05–06; BR-01–08, BR-10–11, BR-14 | F-01, F-02, F-03 | 1 |
| F-05 | Identified owner results: count, frozen scale interpretation, rating mean/distribution, no-data states and identified text after closure without identity labels. | FR-07; BR-02, BR-12–14, BR-16 | F-03, F-04 | 1 |
| F-06 | Anonymous mode: identity/answer separation, no owner-visible raw text on any result surface, question-level quantitative release, status-only self-service and truthful disclosure. Text collection/storage is a blocking pre-F-06 team decision. | FR-08; FR-06 (anonymous); BR-03, BR-06, BR-08, BR-13–16; NFR-06 | F-01–05 and accepted privacy/collection contract | 2 |
| F-07 | Starter Questionnaire and bounded survey expansion: preview/copy a seeded version into an independent Draft, customize before publication, single-choice questions, duplicate-to-Draft for another owned lecture and eligible-member subset. | FR-09, FR-13; BR-03, BR-07, BR-09, BR-16–18, BR-23; NFR-09 | F-02–05; shared lifecycle/validation; integration with F-06 before S2 release | 2 |
| F-08 | Authorized aggregate CSV export following result visibility and anonymous suppression rules. | FR-10; BR-02, BR-12–13, BR-16 | F-05, F-06, F-07 | 2 |
| F-09 | Historical Course/Section/date/state filtering, compatible lecture trends and labelled per-metric Course/own-instructor summaries, excluding hidden questions and rankings. | FR-11; BR-02, BR-12–13, BR-18–19 | F-02 context APIs, F-05 results, F-06 question release and F-07 metric provenance; F-08 is not a prerequisite for history reads | 3; working progress by 29 Nov |
| F-10 | One private issue/action note per owned Closed survey with accessible results; simple Planned/Applied status, essential timestamps and revision-safe editing. No detailed workflow/history. | FR-14; BR-02, BR-13, BR-20–22; NFR-09 | F-03, F-05 and F-06 per-question privacy; may be built alongside F-09 | 3; bounded progress by 29 Nov |

## Named system responsibilities

These are engineering responsibilities, not extra user-facing features or a mandatory feature-count quota.

| ID | Responsibility | Requirements | Establish / verify |
| --- | --- | --- | --- |
| SYS-01 | Database migrations, reproducible synthetic seed, configuration and setup/build instructions; additive template/note schema changes preserve historical records. | FR-12; NFR-02–03, NFR-09 | Sprint 1; Docker/redeployment in Lab 5; template seed S2 and notes S3. |
| SYS-02 | Release engineering: contracts before implementation, Issues/board, feature branches from staging, teammate reviews, integrated release and evidence tied to commit. | NFR-05, NFR-08 | Sprint 1; CI quality gates and GCP pipeline in Lab 5; maintained afterward. |
| SYS-03 | Privacy/security across schema, sessions, APIs, UI, logging, exports, comparison results and private notes. | BR-01–02, BR-13–16, BR-19–22; NFR-01, NFR-06 | Basic access/disclosure S1; anonymous S2; note/analysis regression S3. |
| SYS-04 | Integration, usable UI states, performance verification, cross-team UAT, approved maintenance and regression/defect closure; bounded P15 feedback-cycle usability sessions, not a new feature. | NFR-02, NFR-04–05, NFR-07–08; FR-07/FR-14 user goals | Basic integration/UI S1; Labs 6–7; P15 evaluation/final verification S3. |

## Scope control

Course-administration UI, staff delegation, multiple-choice with multiple selections, scheduling, PDF data export, cross-instructor comparisons, AI feedback insights, template administration and shared improvement notes are excluded. Shared notes remain a proposal requiring agreement. Anonymous and aggregate export are instructor-theme baseline work; Starter Questionnaire and private notes are owner-requested product extensions. None expands Sprint 1.

Detailed AC and test IDs will be assigned in Issue #5 before each Sprint 1 feature is implemented. This inventory does not claim that those contracts or tests already exist.

## Feature boundaries and completion outcomes

These are planning-level outcomes, not substitutes for feature contracts or execution evidence.

| Feature | Included outcome | Boundary / deliberate omission |
| --- | --- | --- |
| F-01 | Real credential checking, current identity, fixed-lifetime revocable session, CSRF enforcement and negative access tests. | No signup/recovery/SSO or role selector granting backend identity. |
| F-02 | Section-scoped navigation, immutable seeded context IDs and role-appropriate survey discovery. | No Course/Section/member/lecture CRUD UI; SYS-01 seed is independent of the login UI. |
| F-03 | Entire Draft definition saved atomically; publish snapshot; close; invalid transition and wrong-owner rejection. | No reopen or published question changes; one survey per lecture. |
| F-04 | Whole response persists once; student can reopen their identified response/status; duplicate/close races are tested. | No partial autosaved answer draft, post-submit editing or cross-student lookup. |
| F-05 | Identified count, frozen scale-labelled mean/distribution, optional-answer denominator and identified plain-text comments after closure. | No raw identity list/public summary/overall instructor score; S2 anonymous extension never exposes raw text. |
| F-06 | No anonymous raw-text exposure, separate question-answer threshold/sparse-bin release, reviewed identity/answer separation and a resolved collection policy before enabling. | No reliance on survey total alone, owner raw-text viewer, subgroup filtering, infrastructure anonymity guarantee or checkbox-only anonymity. |
| F-07 | One seeded versioned starter with single-dimension ratings; consistent immutable-version or mutable-revision copy snapshots, independent definitions and customizability. | No live propagation, mixed-version source copy, template-builder role, answer copy or arbitrary template editing/deletion. |
| F-08 | UTF-8 aggregate CSV with safe escaping, owner scoping and consistent privacy filtering. | No identities, raw comments, notes, individual answers or PDF export. |
| F-09 | Course/Section/date/state history filters and compatible per-lecture/per-metric summaries, visible observations/counts and answer-weighted aggregation with labels. | No cross-owner join, category-only comparability, hidden-data pooling, anonymous text inference or universal instructor score/ranking. |
| F-10 | One owner-private issue/action note, Planned/Applied choice, essential timestamps and optimistic edit conflicts. | No detailed history, reversal reason, mandatory reflection, discussion, publishing, notifications or claim that Applied caused better outcomes. |

## Dependency and integration policy

SYS-01 creates the minimum identity/context schema and seed before F-01/F-02 runtime verification; F-01 must not depend on a feature that in turn requires successful login to be seeded. Database setup is therefore a shared foundation rather than a cyclic feature dependency.

F-06 and F-07 can be specified and developed in bounded parallel work after F-03–05, but must pass a combined anonymous/starter/choice/subset regression before S2 release. F-08 consumes the same results authorization/projection service as F-05. F-09 and F-10 consume closed results independently; neither must wait for the other's UI. The later lab responsibilities apply to the evolving application regardless of feature allocation.

## Changes from version 0.1

- Preserve F-01–F-09 and SYS-01–SYS-04 IDs; append F-10 only.
- Replace ambiguous Classroom with explicit Course/Section/Lecture context in F-02.
- Expand F-07 with FR-13 starter-copy/version isolation; keep it in Sprint 2.
- Add FR-14 private improvement notes in F-10/Sprint 3 and comparability/suppression rules for F-09.
- No feature is claimed complete and no mandatory anonymous/export work is removed.

## Final consolidation (version 0.3)

PD-01 changes F-06 projections and F-08/F-09 consumption without adding IDs or moving sprints. PD-02 removes unnecessary F-10 history/workflow complexity. PD-03 revises F-07 starter content, not historical implemented questions. BASE-03/04/06 provide product direction now and detailed S1 contracts in Issue #5; BASE-02/05/07 detailed preparation remains before the relevant S2 feature. BASE-08 detailed note contracts remain S3. See the [finding register](baseline-review.md) for status, evidence locations and safe deferral gates.

## Review recommendation disposition, without scope inflation

The owner's clarification attributes P10/P05/P14/P15 to Section 8 Innovation Opportunities of the teammate's Comprehensive Review, not instructor mandates. Keep P10 in F-07 and P05 in F-07/F-09; Simplify P14 to private F-10 and Defer optional sharing; Incorporate P15 into SYS-04/S3 QA. No new feature/requirement ID is added. The separate Initial Review REV-08 concerns explicit pre-contract dispositions, not another innovation feature. See the [source-qualified evaluation](baseline-review.md) for value/complexity/trade-offs and the full-report access limitation.
