# LECTRA — Product Baseline Review

Review date: 2026-11-06. Type: AI-assisted documentation consistency and assignment-coverage audit requested by the project owner. This is not a human teammate review, test run of the application, score prediction or approval to merge.

Review context: PR [#7](https://github.com/Maibokdaimhai/LECTRA/pull/7), base `staging`, previously published head `76de388`. At inspection, the PR was open/unmerged and the GitHub review, inline-comment and conversation-comment lists were empty. These are observations at inspection time, not a promise that remote state will remain unchanged.

## 1. Inputs and scope

- `group_work_specs_v1.pdf`: whole-product requirements, Theme 10 on page 9, engineering workflow, timeline and Labs 5–7. The supplied master is marked draft.
- `project_deliverable_1_v1.pdf`: Parts A–F, preimplementation contracts, working Sprint 1, PDF and execution/history evidence.
- Existing six planning documents and actual Git/PR state.
- Owner-supplied `LECTRA – Product Direction and Documentation Improvements`: proposals evaluated for this revision, not instructor mandates or human review evidence.

Scope is planning documentation for Issues #1–#4. The audit checks product coherence, mandatory coverage, stable IDs, dependencies, historical data, privacy and implementability. It does not certify Part E/F, anonymity, deployability, performance or application correctness without implementation and observed tests.

## 2. Findings and documentation corrections

| Finding | Risk before revision | Correction / remaining boundary |
| --- | --- | --- |
| Ambiguous Course/Classroom/Section hierarchy | Wrong ownership inheritance and inconsistent data/navigation. | Explicit Course → Section → Lecture; Section owner is the access boundary. Seed-only context keeps S1 small. |
| No starter version/copy model | A future template edit could silently alter historical surveys or question meaning. | Seeded immutable versions and fresh survey/question/option copies; no live propagation; F-07/S2. |
| Starter provenance mistaken for comparison equivalence | Modified questions could be averaged as the same measurement. | Immutable exact metric definitions; editing measurement clears comparability; title/category/source alone insufficient. |
| No action-record feature | Product collected results without recording an instructor's planned response. | Append private Teaching Improvement Notes as F-10/S3 with one-per-survey, validation, status and revision rules. |
| Sharing proposal lacked privacy/audience rules | Private student feedback could be republished through notes. | Private initial scope, no automatic quotes or shared toggle. Sharing is deferred and explicitly does not count as delivered student communication. |
| Hidden-results policy not applied to future consumers | Trends or notes could bypass anonymous result suppression. | One centralized result policy across summary/export/history/notes; suppressed surveys cannot contribute hidden values. |
| Submission/closing rules omitted Draft-edit/publication race | A stale editor could mutate definitions after publication. | Every Draft mutation and publication takes the same survey lock before state validation; real DB race checks planned. |
| Payload-size mismatch with Unicode limits | Ten valid 2,000-code-point emoji answers could exceed a 64 KiB JSON cap. | Plan 128 KiB cap and explicit 413 handling; distinguish transport limit from answer validation. |
| Session lifetime described only through cookie settings | Store/touch behavior could extend a supposedly fixed session. | Server-side authenticated-at absolute-age check as well as cookie expiry; verify pinned middleware behavior. |
| Seed/discovery dependency wording suggested a cycle | Authentication and seeded context could appear to block each other. | SYS-01 seeds identity/context first; F-01/F-02 share that foundation rather than cyclic runtime dependencies. |
| All-optional surveys could accept an empty response | Participation counts could imply feedback where no answer exists. | Require at least one valid answer and at least one quantitative question in a published survey. |
| Export safety needed more than ordinary CSV quoting | User-authored titles/prompts may be interpreted as formulas. | Plan target-reader-aware formula-safe text handling and actual adversarial export checks; no universal protection claim. |
| Future feature details were uneven compared with the theme section | A detailed palette could conceal missing domain/data/privacy decisions. | Expand SRS, features, traceability, SDS and plan together; preserve visual guidance without treating it as engineering completion. |

These are documentation corrections. The associated runtime risks remain unverified until the relevant contracts, code and tests exist.

## 3. Proposal disposition and trade-offs

| Direction | Result |
| --- | --- |
| Lecture-level vision with four feedback categories | Incorporated; no separate end-of-term/instructor-ranking product. |
| Explicit Course/Section/Lecture | Incorporated into domain, seed, access, UI context, queries and planned fixtures. |
| Starter Questionnaire in S2 | Incorporated into F-07, preserving all F-01–09 IDs. One seeded catalog/version is sufficient. |
| Teaching Improvement Notes in S3 | Incorporated as F-10; private rather than shared initial scope. |
| Understand feedback across lectures | Bounded to exact compatible ratings from owned Closed, visible surveys; per-lecture counts and caveats. |
| Communicate improvements to students | Not promised by private notes. Shared/public summaries remain a proposal requiring audience/redaction/publication decisions and scope review. |
| Avoid unnecessary complexity | Reuse Draft editor, shared results policy and results screen; no microservice, AI, notification, discussion or new role. |

## 4. Deliverable 1 rubric coverage audit

| Part | Points in supplied handout | Current document coverage | What remains before assessed completion |
| --- | --- | --- | --- |
| A — SRS and product scope | 10 | Problem/actors, explicit scope/exclusions, glossary, 14 FRs, 23 BRs, 9 measurable NFRs, assumptions and decision gates. | Substantive teammate review, resolve relevant open decisions and retain actual history. |
| B — Feature inventory / traceability | 10 | F-01–10/SYS-01–04, dependencies, all 46 requirements allocated with planned verification. | Stable AC/test IDs after contracts, actual files/results/versions after execution; maintain coverage under revisions. |
| C — System-Level SDS | 15 | Stack/layers, model/relationships/constraints, transactions, UI/theme/API conventions, role/ownership, sessions, configuration and planned delivery. | Pin compatible versions; feature-level details before code; no deployment proof claimed. |
| D — Three-sprint plan | 5 | Goals, IDs, dependencies, outcomes, S3 progress checkpoint, Labs 5–7 overlap, two-person rotation and risks. | Real names/IDs, available work sessions and accepted assignments; track actual progress. |
| E — Sprint 1 engineering contracts | 20 | Planning prerequisites and verification areas identified only. | Issue #5: complete each S1 feature's design/UI/API/data specs, AC/STS and Product DoD before implementation; retain revisions/TDD history. |
| F — Working Sprint 1 / verification | 20 | Future evidence requirements acknowledged; no application evidence. | Running UI/API/DB increment, automated tests/demos, valid/invalid identity/access cases, real PR reviews/integration, accepted main release and self-contained PDF. |

This PR is intended to strengthen Parts A–D, not claim 40 points or any grade. It cannot complete Deliverable 1 by itself. Documentation length and visual polish are not verification evidence.

## 5. Mandatory evidence still to capture when work occurs

- Complete normal UI/API/database journey and persisted readback, meaningful rejection, login/logout and forbidden role/ownership operation, with role/preconditions/steps/expected/actual and feature/AC labels.
- Unit logic, real API/PostgreSQL integration and selected UI/E2E tests; negative/boundary/access cases and meaningful TDD failures before correction/passes afterward with actual versions.
- Build/test commands, tested release commit, files/test names, counts including fail/skip, AC-to-test results table and two short actual automated-test excerpts (domain rule and role/ownership).
- Two completed Issues and their PRs, feature/contract references, branches, authors/reviewers, substantive teammate review, staging/main integration, final board status and release tag/commit.
- Both students' real contributions, identified pair work, AI-use declaration, known incomplete work and safe synthetic demo setup.
- One readable PDF containing complete Parts A–E and selected F evidence, contents/navigation with actual page ranges, team identity, repository and immutable release. Root README setup commands must be real and reproducible.

No completed Docker/CI/CD/GCP deployment, separate demo video or cloud URL is required for Deliverable 1; design support is required now and delivery completion is assessed in Lab 5. Lab 7 needs its own instructor/TA-approved change to existing behavior, not merely a new planned baseline feature.

## 6. Verification performed for this documentation revision

Observed local documentation checks on 2026-11-06:

| Check | Observed result | Limit |
| --- | --- | --- |
| English text, relative file links, balanced code fences and Markdown table column structure | Passed across all eight Markdown documents; the Markdown parser recognized 46 structurally consistent tables and two Mermaid source blocks. | Source-structure check, not rendered diagram, screenshot or screen-reader testing. |
| Requirement definitions/coverage | Passed: 14 FR, 23 BR and 9 NFR IDs each defined once in SRS and once in traceability; all referenced IDs resolve and inventory has planned coverage. | 46 planned requirements, not 46 executed tests. |
| Feature/responsibility definitions and trace allocation | Passed: F-01–F-10 and SYS-01–SYS-04 resolve; every requirement row has a feature/responsibility, sprint and planned verification. | Detailed AC/STS and actual results remain future work. |
| Cross-document design checks | Passed for Course/Section/Lecture hierarchy, S1 exclusions, S2 starter, S3 notes, private sharing decision, 128 KiB cap and retained theme subsections. | Automated presence checks supplemented by AI semantic review; human review still pending. |
| `git diff --check` | Passed after the revision. | Whitespace check only. |

These are observed documentation checks, not application tests or human approval. Runtime/unit/API/database/E2E/load/privacy/migration tests are **Not run** because no application exists. Mermaid source has been reviewed as source; a Mermaid rendering engine was unavailable in the bundled runtime, so rendered diagram layout has not been verified. Inspect the GitHub preview before final PDF assembly and render the final report as part of that artifact's own verification.

## 7. Remaining gates and honest completion status

See OPEN-01–OPEN-10 in the [decision log](decisions.md). In particular: real teammate review and work allocation; compatible package versions; S1 contracts before code; anonymous privacy design before F-06; starter wording/metric semantics before F-07; CSV compatibility before F-08; note status/private scope before F-10; actual GCP resources and approved Lab 7 change when needed.

The PR may be ready for human planning review after the documented consistency checks pass. It is not ready to claim an implemented increment, completed anonymous protection or accepted release. Issues #1–#4 should be assessed against their checklists after real review rather than closed solely because this report exists.
