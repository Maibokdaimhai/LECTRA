# LECTRA — Feature Inventory

Version: 0.2 (2026-11-06). Status: revised planning draft. Related issue: [#2](https://github.com/Maibokdaimhai/LECTRA/issues/2).
Source requirements: [SRS](srs.md). All features are planned, not implemented or verified.

| ID | Feature / outcome | Requirement links | Dependencies | Sprint |
| --- | --- | --- | --- | --- |
| F-01 | Authentication and access foundation: login/logout/me, database-backed sessions, backend role/record guards. | FR-01; BR-01–02; NFR-01 | Seeded identity and database setup under SYS-01 | 1 |
| F-02 | Seeded Course/Section/Lecture context and discovery: reproducible owners, offerings, memberships, lectures and eligible survey lists. Shared Course never implies shared owner access. | FR-02, FR-12; BR-02–04, BR-23 | SYS-01 supplies identities/context first; F-01 supplies authenticated discovery | 1 |
| F-03 | Survey authoring/lifecycle: rating/text Draft creation/edit/delete, validation, publish with eligibility snapshot, manual close and structural locking. | FR-03–04; BR-02–05, BR-07, BR-09–11, BR-14, BR-23 | F-01, F-02 | 1 |
| F-04 | Identified response submission and retrieval: atomic validated submission, duplicate prevention, confirmation/status and own-answer retrieval. | FR-05–06; BR-01–08, BR-10–11, BR-14 | F-01, F-02, F-03 | 1 |
| F-05 | Owner results: response count, rating mean/distribution, no-data states and text feedback after closure without identity labels. | FR-07; BR-02, BR-12–14, BR-16 | F-03, F-04 | 1 |
| F-06 | Anonymous response mode: identity/answer separation, status-only self-service, truthful disclosure and privacy-threshold enforcement. | FR-08; FR-06 (anonymous); BR-03, BR-06, BR-08, BR-13–15; NFR-06 | F-01–05 and accepted privacy contract | 2 |
| F-07 | Starter Questionnaire and bounded survey expansion: preview/copy a seeded version into an independent Draft, customize before publication, single-choice questions, duplicate-to-Draft for another owned lecture and eligible-member subset. | FR-09, FR-13; BR-03, BR-07, BR-09, BR-16–18, BR-23; NFR-09 | F-02–05; shared lifecycle/validation; integration with F-06 before S2 release | 2 |
| F-08 | Authorized aggregate CSV export following result visibility and anonymous suppression rules. | FR-10; BR-02, BR-12–13, BR-16 | F-05, F-06, F-07 | 2 |
| F-09 | Owned Course/Section/lecture history, filtering and compatible-rating trends; no complete-instructor evaluation claim. | FR-11; BR-02, BR-12–13, BR-18–19 | F-02, F-05, F-06 suppression and F-07 metric provenance; F-08 is integrated but not a logical prerequisite for a history read | 3; working progress by 29 Nov |
| F-10 | Teaching Improvement Notes: one private issue/action/reflection record per owned Closed survey with visible results; Planned/Applied status and revision-safe editing. | FR-14; BR-02, BR-13, BR-20–22; NFR-09 | F-03, F-05 and F-06 privacy policy; may be built alongside F-09 | 3; bounded progress by 29 Nov |

## Named system responsibilities

These are engineering responsibilities, not extra user-facing features or a mandatory feature-count quota.

| ID | Responsibility | Requirements | Establish / verify |
| --- | --- | --- | --- |
| SYS-01 | Database migrations, reproducible synthetic seed, configuration and setup/build instructions; additive template/note schema changes preserve historical records. | FR-12; NFR-02–03, NFR-09 | Sprint 1; Docker/redeployment in Lab 5; template seed S2 and notes S3. |
| SYS-02 | Release engineering: contracts before implementation, Issues/board, feature branches from staging, teammate reviews, integrated release and evidence tied to commit. | NFR-05, NFR-08 | Sprint 1; CI quality gates and GCP pipeline in Lab 5; maintained afterward. |
| SYS-03 | Privacy/security across schema, sessions, APIs, UI, logging, exports, comparison results and private notes. | BR-01–02, BR-13–16, BR-19–22; NFR-01, NFR-06 | Basic access/disclosure S1; anonymous S2; note/analysis regression S3. |
| SYS-04 | Integration, usable UI states, performance verification, cross-team UAT, approved maintenance and regression/defect closure. | NFR-02, NFR-04–05, NFR-07–08 | Basic integration/UI in Sprint 1; Labs 6–7 during continued development; final verification Sprint 3. |

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
| F-05 | Correct count, per-question mean/distribution, optional-answer denominator and owner-visible plain-text comments after closure. | No raw identity list, public summary or synthesized overall instructor score. |
| F-06 | Reviewed identity/answer separation with truthful disclosure, status-only self lookup and result-threshold enforcement in every read path. | No claim of unlinkability against infrastructure operators; no checkbox-only anonymity. |
| F-07 | One seeded versioned starter covering four categories; independent definition copies and customizability; single-choice/subset/copy controls. | No template-builder role, automatic propagation, answer copy or arbitrary template editing/deletion. |
| F-08 | UTF-8 aggregate CSV with safe escaping, owner scoping and consistent privacy filtering. | No identities, raw comments, notes, individual answers or PDF export. |
| F-09 | Section/date/state filters and per-lecture compatible-rating series with visible counts and metric meaning. | No cross-owner join, category-only comparability, pooling suppressed data or course/instructor ranking. |
| F-10 | Exactly one owner-private note; issue/action/reflection, status transition history and optimistic edit conflicts. | No discussion, notifications, student publishing, AI analysis or evidence that Applied caused better teaching outcomes. |

## Dependency and integration policy

SYS-01 creates the minimum identity/context schema and seed before F-01/F-02 runtime verification; F-01 must not depend on a feature that in turn requires successful login to be seeded. Database setup is therefore a shared foundation rather than a cyclic feature dependency.

F-06 and F-07 can be specified and developed in bounded parallel work after F-03–05, but must pass a combined anonymous/starter/choice/subset regression before S2 release. F-08 consumes the same results authorization/projection service as F-05. F-09 and F-10 consume closed results independently; neither must wait for the other's UI. The later lab responsibilities apply to the evolving application regardless of feature allocation.

## Changes from version 0.1

- Preserve F-01–F-09 and SYS-01–SYS-04 IDs; append F-10 only.
- Replace ambiguous Classroom with explicit Course/Section/Lecture context in F-02.
- Expand F-07 with FR-13 starter-copy/version isolation; keep it in Sprint 2.
- Add FR-14 private improvement notes in F-10/Sprint 3 and comparability/suppression rules for F-09.
- No feature is claimed complete and no mandatory anonymous/export work is removed.
