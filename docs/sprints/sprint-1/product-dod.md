# LECTRA - Product Definition of Done

Version 0.1, 2026-11-06. Proposed under [#5](https://github.com/Maibokdaimhai/LECTRA/issues/5). **Not yet adopted; PR #29 received changes-requested review, with re-review pending.** Applies to F-01-F-05 and the integrated Sprint 1 product; later features extend it through a versioned review. Scope/register: [Part E](README.md). Protocol/ID/data conventions: [shared contract](shared-contract.md).

## 1. Authority and how to apply this document

Instructor requirements come from `group_work_specs_v1.pdf` sections 5.2/8.2 and `project_deliverable_1_v1.pdf` sections 3.5/3.6: implement required behavior, execute meaningful planned verification, complete human review/integration, keep setup/docs current and disclose incomplete work. The instructor also requires the working domain increment, access/persistence tests and assessed-release evidence. DOD IDs, evidence tables and the feature/release separation below are team conventions for demonstrating those outcomes, not additional instructor-assigned feature counts or test quotas.

Three different boundaries must remain distinct:

| Boundary | Completion evidence |
| --- | --- |
| Documentation/contract task | Concrete source/design/AC/STS/DoD consistency, appropriate document checks, actual authorized version/PR, and substantive teammate review/integration. It can complete without claiming a working app or application tests. |
| Implemented feature | Applicable DOD-01-DOD-10 below, feature-specific AC and evidence, actual teammate-reviewed integration and disclosed remaining dependencies. A feature is not Done because the contract was written. |
| Sprint 1 release/Deliverable 1 | All required F-01-F-05 behavior plus DOD-01-DOD-12 at integrated product/release scope. Feature completion does not itself prove an accepted main release or complete Parts A-F PDF. |

No global requirement to wait for every feature contract before starting one feature. Before implementation, that feature's contract/STS and the shared DoD/conventions must have actual reviewed/versioned agreement, and its real setup/domain prerequisites must be available. Technical foundation work may proceed under its own recorded bounded setup design; it is not permission to implement unspecified domain rules.

## 2. Product completion criteria

The table states required future outcomes. None of the entries is a checked-off result in this draft. Feature-specific N/A cases need a reason and reviewer agreement, never a silent exemption from required product-level verification.

| ID | Observable condition for Done | Required evidence and boundary |
| --- | --- | --- |
| DOD-01 | Implemented behavior matches the accepted feature scope and each applicable AC across its stated UI/API/data layers. | Feature/FR/BR/NFR -> stable AC -> actual test/check mapping, tested versions and observed outcome; later-sprint omissions explicit. No mock-only success or renamed scope used to hide missing behavior. |
| DOD-02 | Feature SDS, applicable UI/API/schema details, AC/STS and significant rule changes are versioned before their implementation. | Actual contract/test-design commit/review and implementation sequence; decision/rationale/impact for revisions. A spec-only commit is useful, not a required number of commits. Never reconstruct history. |
| DOD-03 | Important pure logic has meaningful unit verification, with relevant positive/negative/boundary assertions. | Actual test file/case/command/result. Examples: expiry, validation, allowed transitions, denominators/rounding. A stub assertion, zero meaningful tests or code-shaped assertions are insufficient. |
| DOD-04 | Persistence, access and transactions use real API/PostgreSQL integration verification. | Real DB rows/constraints/readback and safe rejection/rollback assertions; restart retrieval where applicable. Auth/role/ownership/eligibility and concurrent duplicate/close ordering must be exercised on actual feature routes, not only a guard mock. |
| DOD-05 | Selected critical journeys run through actual UI/API/database and show usable error/access states. | Selected Playwright cases plus justified supplementary manual UI observations; core keyboard/labels/focus at 360px/1280px. No fake frontend actor selector or mocked login used as authentication proof. |
| DOD-06 | Meaningful rule/defect/change work preserves intended-behavior failing-before/passing-after evidence without weakened assertions. | RED/GREEN case, real versions, command/output and explanation. Unrelated syntax/import failure alone does not demonstrate the rule. Apply to important rules, not artificial TDD for prose-only edits. |
| DOD-07 | Auth/security/privacy projections are enforced on the backend and current UI surfaces truthfully describe the implemented mode. | No plaintext credentials/real secrets/logged cookies/tokens/raw feedback; trusted identity; safe errors/no-store; respondents cannot manage/cross-read; owner scope and comment projection tested. S1 is identified; anonymous features remain disabled until their later contract/tests are accepted. |
| DOD-08 | Actual required build/typecheck/relevant tests were run on the changed/integrated version and inspected; failures/skips are disclosed and resolved for required scope. | Commands, environment/schema/lockfile, source/test names, pass/fail/skip counts, tested SHA and safe output. A feature branch check does not prove the later integrated/main version. No invented coverage percentage or disabled required test. |
| DOD-09 | Bounded Issue/branch/PR traceability, substantive opposite-member review and integration are complete for the accepted work. | Real PR base from staging, actual author/reviewer, specific check/question/finding/reason, correction/recheck and integration version. AI audit/self-approval is not teammate review. Both students' actual contributions/pair work are described accurately. |
| DOD-10 | Setup/configuration/migrations/seed and feature documentation match the actual behavior, and known limitations are disclosed. | Reproducible actual migrate/seed/run/build/test instructions, example configuration without real secrets, safe synthetic fixture data and test-DB safeguards; actual source of any unresolved issue. No startup reset, memory-only durable data or invented commands. |
| DOD-11 | The integrated Sprint 1 domain journey, meaningful rejection and access restrictions are accepted and released through a reviewed staging-to-main PR. | Owner login/create/publish -> eligible student login/validate/submit once/read persisted outcome -> owner close/summary; duplicate/Draft/Closed and access rejection; actual system/integration checks; substantive release review and immutable main release tag/SHA. Apply at release level, not as a requirement that every docs PR builds an app. |
| DOD-12 | Deliverable 1 contains readable Parts A-F and actual release-linked evidence/contributions in one team PDF, with repo sources/tests/docs retained. | Both students' supplied names/IDs, theme/context, repo and actual assessed tag/SHA; build/tests on that actual accepted main version, selected readable evidence and known gaps; PDF checked for completeness/legibility. #6 plans, #26 assembles. No fabricated participant information or review history. |

Docker, completed CI/CD and GCP setup are Lab 5 outcomes, designed for now and maintained afterward. Their absence is not a new Sprint 1/Deliverable 1 failure invented by this DoD. Actual local build/test and release evidence are still required at this checkpoint. Do not claim cloud deployment, enforced CI gates or a backup was tested until it happened.

## 3. Contract-document acceptance checklist

Use this for the current #5 shared-document change and each #10-#14 contract task. These are proposed review checks, not completed approvals:

- [ ] Source authority and scope are explicit; team choices/proposals are distinguished from instructor outcomes.
- [ ] The shared document or bounded feature has a concrete design, relevant dependency/permission/error/boundary behavior and applicable layer details. For a feature contract, no-change layers are stated.
- [ ] AC are observable with stable IDs; each maps to suitable STS cases with ID, level, input/precondition, action and expected outcome. Review the assertions' ability to catch a wrong implementation, not just row counts.
- [ ] UI/API/data/security meanings agree with the shared contract and baseline. Cross-feature ownership/migration/transaction responsibilities are assigned and unresolved gates have an owner/next action.
- [ ] Links, tables/Markdown structure, ID uniqueness/coverage and diff hygiene were actually checked, with results identified as document checks.
- [ ] Actual authorized publication version and substantive opposite-member review/integration are recorded; future application verification remains Planned/Not run. A drafted checklist is not human adoption.

The shared #5 change supplies the DoD and conventions. It does not have to invent AC for nonexistent app code, run unrelated application tests, impersonate R1NNE0 or close the umbrella before its other contracts are reviewed.

## 4. Evidence and result-state rules

| Record | Minimum fields |
| --- | --- |
| Contract acceptance | Feature/shared document path/version, actual source commit, real human reviewer/review link, dispositions and accepted change scope. |
| Planned verification | Requirement, feature/sprint, AC ID, STS ID/level, fixtures/preconditions/input, action and expected observable outcome. |
| Actual verification | Actual test file/case, command/date/environment/lockfile/schema, tested SHA, observed result and pass/fail/skip counts, safe output/reference. |
| TDD | Intended rule/assertion, real failing version and output, real passing version and output, actual change rationale; no retroactive fabrication. |
| Review/integration | Issue, branch, actual author/opposite reviewer, substantive review, fix/recheck, integrated version and actual pair work where applicable. |
| Release/report | Actual integrated checks, reviewed release PR, accepted tag/main SHA, post-merge build/test output and readable selected PDF evidence/contributions. |

Use Planned before execution; Not run if a planned check was not executed; PASS/FAIL only after observing output; SKIP only when the runner actually skips and its reason is reported; N/A only with an applicable-scope explanation. Blocked requires a real dependency/condition and owner/action. These states do not mean the same thing. Required failed/skipped/not-run behavior cannot be called Done merely by listing a limitation; record the gap and resolve it or obtain an actual authorized scope decision.

Do not erase failing output or rewrite the assessed SHA after a later correction. Relevant post-fix regression uses the changed version; a new accepted release gets a distinct reference and verification. A screenshot supports readable evidence but does not replace API/DB assertions or substantive human review.

## 5. Adoption and remaining boundary

Both Issue #5 owners must review this proposal and actual cross-feature alignment. Planned reviewer for the current Maibokdaimhai-authored draft is R1NNE0; no review request or acceptance is fabricated. Once legitimately accepted, each feature references the real Product DoD commit/version. Amend through normal recorded scope/review steps when necessary; do not silently make all later policies retroactive.

Current state: shared source proposed in this change; F-01 contract/STS draft aligned; other feature contracts pending; application/tests/release/PDF unimplemented. Actual publication refs are recorded in #5/#10 and the PR. #5 remains Open until the common agreement and all five actual preimplementation contracts meet its acceptance scope. This file's existence satisfies no application Done claim.
