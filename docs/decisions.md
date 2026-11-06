# LECTRA — Decision Log

Version: 0.2 (2026-11-06). Status: revised planning draft; actual teammate review is pending.

`Owner direction` is explicitly requested product intent. `Selected` is a working design selected under the owner's delegation and still requiring substantive team review. `Deferred proposal` is not in the implementation baseline. `Open gate` requires a named resolution before its dependent work. None of these means a teammate approved the PR or an implementation was verified. Instructor mandates are distinguished in the SRS source/origin tables; the decisions below are project choices.

| ID | Status | Decision and rationale |
| --- | --- | --- |
| DEC-01 | Owner direction | Focus on feedback after each lecture; reaffirmed in the product-direction attachment. Content/teaching/classroom/general-suggestion questions are categories, not separate evaluation products. Individual lecture results are not complete instructor evaluations. |
| DEC-02 | Selected | Instructor and student roles; one owner per Section; no delegated staff access or multi-role accounts. Course is shared academic context and grants no cross-Section owner permissions. Use seeded contexts/accounts to avoid administration scope. |
| DEC-03 | Selected | Keep React, Vite, TypeScript, Vitest, PostgreSQL, Prisma ORM and Playwright from the team's stated experience. Add Node.js/Express, express-session/connect-pg-simple, Argon2, Zod and Supertest for missing backend responsibilities. Exact compatible versions are selected and locked during authorized setup. |
| DEC-04 | Selected | Modular monolith with one API and one PostgreSQL database; same-origin browser/API delivery. Microservices and separate staging infrastructure are unnecessary for this scope. |
| DEC-05 | Selected | Draft → Published → Closed; manual close, no reopen; freeze structure/mode/eligibility after publication; no submitted-answer editing. |
| DEC-06 | Selected | Sprint 1 uses identified rating/text surveys. Owners see count during collection and results after closure, including text without identity labels. Students can reopen only their own identified answers. This remains identified data in storage. |
| DEC-07 | Selected | Freeze eligibility at publication from Section members. Enforce unique participation and atomic response writes in PostgreSQL; serialize Draft mutations, publication, closing and submission on the survey row where applicable. |
| DEC-08 | Selected | Anonymous mode in Sprint 2; owner/application-user threat boundary, no claim against privileged infrastructure observation. Suppress anonymous results/text/export below five responses. Detailed privacy design must pass a preimplementation gate. |
| DEC-09 | Selected | CSV aggregate export only; no raw-answer/text export. Single-choice, duplicate-to-Draft and eligible-subset controls are bounded Sprint 2 expansion. No instructor ranking, scheduling or AI insights. |
| DEC-10 | Selected | Survey limit 1–10 questions; ratings integer 1–5; text ≤ 2,000 code points; title ≤ 120 and prompt ≤ 500. Required text rejects whitespace-only input. These limits keep validation and tests finite. |
| DEC-11 | Selected | Preserve the empty initial README until a separate authorized documentation change; prepare this documentation on `docs/1-4-product-baseline` from `staging`. On 2026-11-06, the project owner explicitly authorized committing/pushing these documents and opening a PR into `staging`. Merge and implementation remain outside that authorization. |
| DEC-12 | Owner direction | Model Course → Section/offering → Lecture → Survey → derived Results explicitly. Replace the ambiguous Classroom entity in planning only; no production migration is claimed. F-02 remains seeded/read-only context in S1. |
| DEC-13 | Owner direction / selected realization | Add the Starter Questionnaire in F-07/Sprint 2 with four content categories. Realization: one seeded immutable versioned catalog, independent question/option copies into new Drafts, no template administration UI or live propagation. |
| DEC-14 | Owner direction / selected realization | Add Teaching Improvement Notes as new F-10/Sprint 3. Realization: one private note per owned Closed survey with visible results, issue/action/reflection, Planned/Applied status, revision-safe editing and status history. No S1 expansion. |
| DEC-15 | Deferred proposal | Shared improvement notes are not included initially. A shared view would need a separately reviewable public summary, eligible audience, redaction/publication/retraction and tests. Private notes do not yet communicate improvements to students. |
| DEC-16 | Selected | Compatible-rating trends require immutable metric definitions with matching meaning/type/anchors; copied provenance alone is insufficient. Customizing measurement clears the reference. Preserve per-lecture counts and exclude hidden results before analysis. |
| DEC-17 | Selected | Reuse existing Draft editor, results/privacy policy and Closed-results page for starter/notes to limit complexity. No AI, notification, discussion, additional role or external integration is introduced. |
| DEC-18 | Selected | Append FR-13–14, BR-17–23 and NFR-09; preserve all previous requirement IDs and F-01–09. Review new source/copy/concurrency/privacy cases rather than silently replacing old requirements. |

## Open items and gates

| ID | Owner | Required resolution | Gate |
| --- | --- | --- | --- |
| OPEN-01 | Both students | Review selected scope/rules/privacy and record substantive feedback; names/IDs and actual work allocation are not supplied yet. | Before accepting contracts and assigning implementation work. |
| OPEN-02 | Feature implementer + teammate | Pin mutually compatible Node, package and PostgreSQL versions; verify Prisma generation/migration/transaction API and Argon2 runtime support. Do not copy version-dependent APIs from an unrelated version. | Before dependency installation and F-01/F-02 implementation. |
| OPEN-03 | Both students, instructor/TA if needed | Confirm no later course notice supersedes the supplied draft specification or deadlines. | Before assessed submission. |
| OPEN-04 | Both students | Elaborate anonymous storage, batch/order/timing/log controls, exact owner-visible metadata and residual risks; verify identity/answer separation against the declared threat boundary. | Before enabling or implementing F-06 submission behavior. |
| OPEN-05 | Team with Lab 5 guidance | Confirm actual GCP resources/permissions and secret handoff. Proposed Cloud Run/Cloud SQL components are architecture choices, not provisioned infrastructure. | Before cloud deployment. |
| OPEN-06 | Both students + instructor/TA | Agree the maintenance change for Lab 7 against already implemented behavior. Do not invent approval or treat planned baseline expansion as the approved change. | Before Lab 7 change implementation. |
| OPEN-07 | Both students | Review starter wording, 1/5 anchors, optional/required defaults and immutable metric meaning. The supplied questionnaire is a working starting point, not a validated university instrument. | Before F-07 contract acceptance; wording versions cannot change past surveys. |
| OPEN-08 | Both students | Confirm private-note scope, status/revision rules and explicit omission of shared visibility. Any later sharing proposal requires a recorded scope/privacy decision. | Before F-10 contract acceptance. |
| OPEN-09 | Export implementer + teammate | Choose/document spreadsheet compatibility, BOM/formula-safe text policy and verify with target reader; CSV quoting alone is insufficient. | Before F-08 implementation. |
| OPEN-10 | Both students | Write complete Sprint 1 feature contracts, AC, STS and Product DoD, preserving their actual preimplementation versions. | Before each S1 feature's code; no claim that this Parts A–D PR replaces Issue #5. |

## Product-direction proposal disposition

| Proposal from the attachment | Disposition | Rationale / consequences |
| --- | --- | --- |
| Lecture-focused vision and explicit Course/Section context | Incorporated. | Fits Theme 10 and the existing vision; data/navigation/access now explicitly follow Section ownership. Seed-only S1 avoids administration expansion. |
| Starter Questionnaire in Sprint 2 | Incorporated in existing F-07. | Independent versioned copies preserve historical definitions; no unnecessary feature-ID renumbering or template-manager role. |
| Teaching Improvement Notes in Sprint 3 | Incorporated as F-10 with private initial visibility. | Closes the instructor's reflection/action-recording loop while avoiding student-data republication. This does not fulfill a student communication workflow, which is deferred. |
| Course/instructor-wide feedback understanding | Bounded to owned lecture history/compatible trends. | A small/biased lecture response set is not a complete instructor assessment. No cross-owner dashboard or ranking. |
| Private and shared note visibility | Private selected; shared deferred. | Shared publication adds audience/redaction/retraction rules and privacy tests; do not add it blindly to the two-person baseline. |
| Preserve IDs and mandatory theme scope | Preserved and extended. | F-01–09 unchanged in identity; F-10 appended. Anonymous/export stay S2 and S1 remains F-01–05. |

## Impact and change-control procedure

Any later accepted change records its source, rationale, affected FR/BR/NFR, feature/sprint, SDS entities/endpoints, AC/tests and release implications. Append IDs for genuinely new requirements; preserve prior definitions in Git history. Versioned template content/metric changes cannot silently rewrite historical comparisons.

Implementation start requires the relevant contract to be recorded before code; a spec-only commit is useful, but no arbitrary commit-count quota is imposed. A student's review must be their own substantive check/question/finding/reason for approval. AI consistency review and proposed work assignments are never substituted for actual teammate review or contribution evidence.

## Revision record

| Date | Version | Change | Evidence status |
| --- | --- | --- | --- |
| 2026-11-06 | 0.1 | Initial planning draft for Issues #1–#4 using the two supplied PDFs and owner's delegated scope/stack instruction; authorized for commit, push and PR submission. | Planning documents only; teammate review pending; no implementation or test execution claimed. |
| 2026-11-06 | 0.2 | Product-direction revision: explicit Course/Section, starter copy/version rules, F-10 private notes, comparable trends and fuller engineering review. | Working documentation revision. Earlier commits `fe6324f` and `76de388` are real planning/theme history; no human approval or runtime evidence inferred. |
