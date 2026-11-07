# Sprint 1 - Part E Contract Register

Version 0.1, 2026-11-06. Working draft for [umbrella #5](https://github.com/Maibokdaimhai/LECTRA/issues/5). Shared owners: Maibokdaimhai and R1NNE0. This register records proposed documents and review gates; it is not an approval, completed contribution table or implementation/test result.

## 1. What must precede implementation

#5 has two responsibilities: common Product Definition of Done/conventions, and coordination of the five feature contracts #10-#14. It is not a sixth product feature or a separate copy of every child Issue. Complete the common reviewable foundation first, then elaborate/review each feature's own contract before coding that feature. A feature does not wait for all five contracts or for the umbrella to close; it waits for its own contract, shared conventions/DoD and its real setup/feature dependencies.

Instructor sources are `group_work_specs_v1.pdf` sections 5.2 and 8.2, and `project_deliverable_1_v1.pdf` sections 3.5-3.6. They require preimplementation feature design, applicable UI/API/data specification, stable AC, STS, DoD, meaningful verification/TDD and human review evidence. The file names, ID syntax, exact protocol/limits and document layout here are team choices. See [SRS source authority](../../srs.md), [shared engineering contract](shared-contract.md) and [Product DoD](product-dod.md).

| Sequence | Bounded outcome | What it does not prove |
| --- | --- | --- |
| Common foundation under #5 | Review the Product DoD, ID/error/UI/data conventions, dependency boundaries and initial opposite-member review allocation. | Does not implement auth, create all feature contracts, or approve unknown student availability. |
| Feature contract under #10-#14 | Record that feature's design, exact UI/API/schema/transaction details, stable AC and mapped STS; obtain real teammate review and retain its version. | A written contract is not an executed test or a working feature. |
| Setup and feature work #15-#21 | Record bounded setup/schema designs; implement the reviewed feature using the actual shared foundation and capture tests when they run. | Tooling setup does not satisfy domain AC; seed does not depend on working login UI. |
| Integration/release/report #22-#26 | Verify combined real behavior, accepted reviewed integration and release-SHA evidence/PDF. | A contract-only PR or opening an Issue cannot complete Part F. |

Minimum foundation for #17 is the reviewed F-01 contract plus shared accepted DoD/conventions and the needed User/session subset of #15/#16. Do not wait for an unrelated future result screen or unimplemented survey seed to authenticate a synthetic account. Domain migrations/fixtures still wait for their applicable reviewed feature/schema design.

#16 is phased within one additive migration history: first User/auth_session and synthetic login accounts after #15/#10/shared review; then Course/Section/Membership/Lecture under #11, survey/question/eligibility under #12, response constraints under #13 and any results-related schema detail under #14. Each phase needs its applicable accepted contract and real verification, not acceptance of every later phase in advance. #17 consumes the verified first subset without waiting for #16 to close. #16 closes only when its whole S1 scope is actually implemented/verified. The [tracker execution gates](tracker.md) use this same distinction.

## 2. Document register and truthful readiness

| Work package | Current artifact | Lead / planned reviewer | Current boundary |
| --- | --- | --- | --- |
| #5 common foundation | This register; [shared contract](shared-contract.md); [Product DoD](product-dod.md) | Shared Issue owners; Maibokdaimhai's current AI-assisted draft, R1NNE0 planned review | Proposed sources in this change; actual publication refs in #5/PR, no human acceptance yet. |
| F-01 / #10 | [Authentication contract](f-01-authentication.md); [STS](f-01-authentication-sts.md) | Maibokdaimhai / R1NNE0 | Contract draft: 20 AC, 47 planned cases, no app tests or approval. |
| F-02 / #11 | No feature contract/STS authored in this change | R1NNE0 / Maibokdaimhai | Context/discovery details remain the child Issue's work. No placeholder link or completed status. |
| F-03 / #12 | No feature contract/STS authored in this change | R1NNE0 / Maibokdaimhai | Draft/lifecycle/publication/scale details remain pending. |
| F-04 / #13 | No feature contract/STS authored in this change | Maibokdaimhai / R1NNE0 | Response transaction/own retrieval contract remains pending; shared transport direction below is not its complete AC/STS. |
| F-05 / #14 | No feature contract/STS authored in this change | R1NNE0 / Maibokdaimhai | Results/projection/denominator contract remains pending. |

Assignments above reflect the existing owner-authorized GitHub allocation; review names are plans, not sent review requests or completed work. Both members own design/code/tests for their bounded features and review the other's work. Actual time/availability and estimates are unconfirmed; no private schedule collection or equal-commit/Issue-count target is required. Before making a firm implementation commitment, each lead confirms the next bounded task and actual review opportunity in its Issue. Unknown capacity does not block drafting this common foundation or count as consent/availability.

## 3. Minimum structure for each child contract

Each feature supplies its own concrete details; do not fill a copied template with unsupported completion statements:

1. Version/status/source authority; feature/FR/BR/NFR/SYS IDs; lead/planned reviewer; scope/exclusions; dependencies.
2. Behavior/workflow/business rules; role and record permission matrix; failures/boundaries; ambiguous-request recovery.
3. UI navigation/fields/loading/empty/validation/expired/forbidden/error states, following the existing cool theme and keyboard/viewport targets.
4. Applicable API method/path, exact request/success/error shape, safe projection, validation, status/precedence and no-change layers stated explicitly.
5. Data fields/types/constraints/migration ownership, authoritative transactions/lock order and reproducible safe fixtures where relevant.
6. Stable observable AC and complete mapped STS: ID, linked AC, level, preconditions/input, action and expected result. Assign actual source files/results only after they exist.
7. Meaningful TDD targets, Product DoD version plus feature-specific evidence, unresolved decisions with owners/gates and actual contract/review history.

The [shared contract](shared-contract.md) gives the conventions and cross-feature checklist. A feature-specific exception must be explained, reviewed and reflected in dependent contracts; an assistant must not silently select a conflicting wire/schema policy.

## 4. #5 acceptance coverage and remaining work

| Umbrella acceptance area | Evidence prepared by this change | What remains before #5 can close |
| --- | --- | --- |
| Feature/requirement/permission/workflow links | Shared boundary matrix; existing inventory/traceability; F-01 draft. | F-02-F-05 concrete contracts and consistency/review. |
| UI/API/data detail and explicit no-change layers | Shared protocol/schema/UI conventions; F-01 exact contract. | Each remaining child supplies exact layer details, constraints and migrations. |
| Stable observable AC | Naming rules; F-01 AC-F01-01 through AC-F01-20. | All other feature AC, including negative/boundary/access cases. |
| STS and AC coverage | Required STS structure; F-01 mapping with 47 planned cases. | Each remaining STS and cross-feature coverage audit. No executed result inferred. |
| Unit, API/real DB and selected browser coverage | Product DoD and shared risk/level matrix. | Feature-specific preconditions/actions/assertions and actual execution in implementation. |
| Login/access/ownership/eligibility/response/lifecycle cases | Shared integration handoffs; F-01 cases and explicit real-domain checks. | Child design for actual survey/response/results routes and transaction/race fixtures. |
| TDD rules/history | Common TDD/evidence plan plus F-01 targeted rules. | Actual RED/GREEN versions/results when coding; no retrospective reconstruction. |
| Product DoD | [Product DoD draft](product-dod.md), scoped separately for docs, features and release. | Actual teammate adoption/review of this version and later evidence of compliance. |
| Preimplementation version/review history | Proposed source; actual publication refs recorded in #5/#10 and PR. | Real substantive opposite-member review and accepted contract versions before code. |

Keep #5 Open. This change prepares the shared prerequisite; it does not declare #10-#14 complete. Record accepted document commits/review links when real, and preserve later justified revisions. #6 plans evidence/PDF capture; #26 assembles actual evidence; neither is replaced by this register.

## 5. Current work and next bounded actions

- Review the shared conventions/DoD and F-01 alignment. Resolve disagreements here before implementation rather than create competing per-feature meanings.
- Continue #10 review/versioning; the other member can draft #11/#12/#14 using this foundation, while #13 covers responses. Do not send a teammate message or fabricate their agreement on their behalf.
- #15 records actual runtime/lockfile/test commands and bounded setup results; #16 coordinates one migration history and safe fixtures. Existing F-01 candidates remain uninstalled/unverified proposals.
- After each accepted contract and available prerequisites, do only that feature's implementation and capture meaningful tests/history. Review/integrate, then run cross-feature checks before release.

No commit, push, PR, implementation, test execution or human review is authorized merely by adding a row to this register. Use the project owner's actual scoped authorization for publication/release actions.
