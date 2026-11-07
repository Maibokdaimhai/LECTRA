# Deliverable 1 - Single-PDF Assembly Outline

Version 0.1, 2026-11-06; planning artifact for #6, execution/assembly under #26. This outline does not replace complete engineering documents or claim that a PDF exists. Follow the [evidence plan](evidence-plan.md) and [register](evidence-register.md).

## Front matter and navigation

- Supplied real names and student IDs of both members: Pending owner/team input; do not invent them.
- CPE334, LECTRA, Theme 10 Review/Feedback/Survey System, lecture-feedback context; repository `https://github.com/Maibokdaimhai/LECTRA`.
- Actual assessed release tag/main commit and local setup reference: Pending release; an initial README or planning commit is not the product release.
- Actual table of contents and A-F navigation table below, generated/checked after pagination. No fixed page limit is imposed; retain complete required content without unnecessary duplication.

| Part | Points | Relevant IDs/content | Actual PDF page range |
| --- | --- | --- | --- |
| A - SRS and product scope | 10 | FR-01-14, BR-01-23, NFR-01-09, actors/scope/decisions | Pending assembly |
| B - Feature inventory and traceability | 10 | F-01-10, SYS-01-04, requirement -> feature -> sprint and actual acceptance/verification extensions | Pending assembly |
| C - System-Level SDS | 15 | Architecture/data/UI/API/auth/access/config/deployment design | Pending assembly |
| D - Three-sprint plan | 5 | S1-S3 outcomes/dependencies and honest remaining work | Pending assembly |
| E - All Sprint 1 engineering contracts | 20 | F-01-F-05 design/UI/API/data/AC/STS and Product DoD, actual versions | Pending assembly |
| F - Working Sprint 1 and verification | 20 | EV-S1-01-12, DEMO-S1-01-05, actual tests/reviews/release/contributions/limitations | Pending assembly |

Use actual PDF page numbers/ranges and internal references, not repository links as a substitute for assessable text. Page references in this draft are deliberately pending, not sample numbers that might be mistaken for the final layout.

## Part A - Complete SRS and product scope

Embed the final accepted `docs/srs.md` content: problem/context, actors/responsibilities, whole-product/S1 scope and exclusions, glossary, all stable FR/BR/NFR and meaningful measurable targets, privacy/ownership/lifecycle decisions, assumptions/questions. Include relevant `docs/decisions.md` dispositions and unresolved gates rather than hiding them in an external file. Distinguish instructor outcomes, owner direction and selected team details. Do not remove later-sprint anonymity/export work because S1 is identified.

## Part B - Complete inventory and traceability

Embed final `docs/features.md` and `docs/traceability.md`: all features/system responsibilities and requirement-to-feature-to-sprint rows, dependencies/completion boundaries, coverage gaps/approved changes. Show accepted S1 AC/planned-test links and reference actual F results by PDF page. Preserve the 46 requirement identities unless a real approved change exists. A pending contract or unexecuted test stays explicit.

## Part C - Complete System-Level SDS

Embed final `docs/system-sds.md`, keeping architecture/components/stack rationale, major data model/ownership/relationships/constraints, migrations/seed, UI cool-theme/conventions, role/access matrix, session/hash/CSRF lifecycle, API/error approach, configuration/secrets and planned Docker/GCP delivery. Include readable diagrams where already relevant; no invented diagram quota. Reflect accepted shared-contract refinements consistently and state actual runtime compatibility/setup limits. Do not describe unprovisioned cloud services or unrun migrations as operational evidence.

## Part D - Three-sprint plan

Embed final `docs/sprints/plan.md`: each sprint's goals/features/dependencies/completion outcome, S1 identified full-stack slice, later work and lab overlap, two-person allocation/rotation and real risks/buffer/remaining work. Distinguish illustrative estimates from actual availability. Record authorized scope changes and unresolved risks; no permanent docs-versus-code team split.

## Part E - All Sprint 1 contracts, not only F-01

Embed the accepted shared register/conventions/Product DoD and each actual F-01-F-05 contract and STS, including relevant UI/API/schema/transactions, stable observable AC, per-test ID/AC/level/preconditions/input/action/expected results, TDD targets and completion evidence. Include actual contract/test-design versions and human review references. Current F-01 sources are a draft in PR #29; #11-#14 remain pending at plan creation. Do not turn missing child contracts into empty headings and call Part E complete.

Product DoD is included once and referenced internally by each feature; feature-specific checks remain with that feature. Preserve justified revisions/history. Exact test-result evidence appears in F, with internal navigation from AC/STS rather than duplicating whole outputs throughout E.

## Part F - Actual increment and selected verification

Assemble in this reading order:

1. Assessed release identity, actual setup summary and implemented/known-incomplete scope. State one common demonstration SHA and exceptions.
2. Selected DEMO-S1-01-05 UI/API/DB screenshots/screen dumps and concise captions, including persisted retrieval/restart, a meaningful rejection, login/logout and forbidden access.
3. Actual build/typecheck/unit/API-real-DB/selected E2E commands, environment and readable runner output with observed pass/fail/skip counts and tested versions. Manual checks are separate.
4. Complete S1 AC -> planned test -> actual file/case -> command/run/SHA -> observed result -> evidence-page mapping from the register/accepted contracts. Show gaps, failures/skips and expected versus actual where needed.
5. Two actual short automated-test excerpts: important domain rule and real role/ownership restriction; relevant setup/assertions, source/version and observed execution. Include meaningful TDD RED/GREEN sequence/results and actual versions.
6. Two completed implementation Issues/PRs with concrete teammate review and staging/main inclusion; compact contract/test-design/implementation/review/integration/release history; final board and release reference.
7. Both members' real contributions/pair work, brief truthful AI-use declaration and known incomplete work/failed/skipped tests with impact and next action.

No full prompt transcript or long reflection is required. No placeholder screenshot, authored hypothetical test excerpt or generic AI statement is actual evidence. The [register](evidence-register.md) provides pending slots until observations exist.

## Final assembly checks under #26

- [ ] One team PDF, complete A-E and selected actual F; actual front matter/names/IDs/theme/repo/release supplied.
- [ ] Contents/navigation has actual page numbers for every A-F part; all internal references resolve.
- [ ] All S1 feature contracts/AC/STS and Product DoD are included, without replacing them with external artifact links.
- [ ] Tables, diagrams, code excerpts and screenshots are readable at normal viewing size; no clipping, overflow, tiny text or broken glyphs. Split wide AC/result tables into readable linked sections if necessary.
- [ ] Demonstration captions and actual build/test/results/review/history agree on the assessed release, with explicit version exceptions.
- [ ] Contributions, AI use, actual limitations/failed/skipped checks and safe reproduction summary are accurate; no secrets or real student feedback.
- [ ] Final board/release evidence is current for submission; repo remains accessible with immutable source/test/docs history for targeted verification.
- [ ] Both students inspect the final PDF and confirm the actual review; no approval is pre-filled by the assistant.

No PDF is generated or final assembly checkbox completed by this documentation task. Completed Docker/CI/CD/GCP and a separate video are not added as Deliverable 1 gates; follow Lab 5/final-project requirements separately.
