# LECTRA — Engineering Documentation Index

**Current operational entry points (2026-11-10):** [root setup/demo guide](../README.md), [fresh setup and handoff](sprints/sprint-1/setup-and-handoff.md), [integrated setup verification](sprints/sprint-1/setup-verification.json) and [release readiness](sprints/sprint-1/release-readiness.md). PRs #35–#38 are integrated. The planning-PR status statements below are historical and must not be read as the current application state; assessed main release/PDF remain separate gates.

Status: consolidated planning revision for PR [#7](https://github.com/Maibokdaimhai/LECTRA/pull/7). The owner explicitly renewed permission to commit/push this revision to the existing branch; teammate review and merge remain team responsibilities. The application is not implemented. This index does not replace the assessed PDF or eventual root README setup instructions.

## Read in this order

| Document | Purpose | Deliverable / issue |
| --- | --- | --- |
| [SRS](srs.md) | Problem, actors, scope, glossary, stable FR/BR/NFR, business states, starter content and privacy boundaries. | Part A / #1 |
| [Decision log](decisions.md) | Owner direction versus selected designs/deferred proposals; review gates and revision rationale. | Supports A–D / #1–4 |
| [Feature inventory](features.md) | F-01–F-10, dependencies, completion boundaries and system responsibilities. | Part B / #2 |
| [Traceability](traceability.md) | 46 requirements mapped to features, sprints and planned verification; instructor-theme cross-check. | Part B / #2 |
| [System SDS](system-sds.md) | Architecture, data, transactions, identity/access, UI theme, API conventions, starter/history/notes, delivery and verification design. | Part C / #3 |
| [Three-sprint plan](sprints/plan.md) | Sprint outcomes, timing, lab overlap, two-person rotation, risks and implementation/release gates. | Part D / #4 |
| [Sprint 1 delivery tracker](sprints/sprint-1/tracker.md) | Dated actual issue/assignee snapshot, dependency order, readiness gates and evidence requirements. Tracking setup does not complete Sprint 1. | Issue #8; operational follow-up |
| [Baseline review](baseline-review.md) | BASE-01–08, PD-01–03, individually dispositioned Section 8 P10/P05/P14/P15, separate Initial Review REV-08 and source limitations. | Planning review, not teammate approval or Part F evidence |
| [Sprint 1 contract register](sprints/sprint-1/README.md), [shared conventions](sprints/sprint-1/shared-contract.md) and [Product DoD](sprints/sprint-1/product-dod.md) | Common Part E prerequisites, stable IDs, UI/API/schema/security consistency, verification/evidence/completion boundaries and remaining child-contract work. | #5 shared foundation drafted; human adoption and remaining #10-#14 acceptance pending |
| [F-01 contract](sprints/sprint-1/f-01-authentication.md) and [STS](sprints/sprint-1/f-01-authentication-sts.md) | Login/session/access UI/API/schema contract, 20 stable AC, planned verification and shared-DoD/setup gates. | Part E / #10 under #5; PR #29 approved/merged for documentation; no auth implementation or executed feature tests |
| [Deliverable 1 evidence plan](deliverable-1/evidence-plan.md), [PDF outline](deliverable-1/report-outline.md) and [register](deliverable-1/evidence-register.md) | A-F assembly/capture plan, demo specifications, draft AC mappings and unfilled actual-run/review/release/contribution records. | #6 planning only; #26 supplies actual evidence/PDF, no runtime PASS or completed release claimed |
| [Sprint 1 board/review workflow](sprints/sprint-1/workflow.md) | Verified Kanban arrangement and configured teammate Write access, branch/PR routing, substantive review, local verification and release/evidence handoff; includes the proposed PR template. | Issue #9; teammate use confirmation and human review/integration remain pending |
| [F-04 responses contract](sprints/sprint-1/f-04-responses.md) and [STS](sprints/sprint-1/f-04-responses-sts.md) | Proposed atomic one-time identified responses, own retrieval, byte/Unicode/access/concurrency boundaries; 25 AC and 36 planned cases. | #13 draft; actual human review and all F-04 execution pending |
| [Workspace design](sprints/sprint-1/workspace-setup.md) and [verification](sprints/sprint-1/workspace-verification.md) | Recorded #15 tooling design, actual runtime/package/setup commands and tooling-only observations. | Does not implement/authenticate/verify product features or complete #16/#24 |

## Current scope at a glance

Issue #16 implementation and actual storage checks: [database foundation/setup](sprints/sprint-1/database-foundation.md) and [verification record](sprints/sprint-1/database-verification.md). These establish persistence prerequisites, not implemented F-01–F-05 workflows or feature STS passes.

- S1: F-01–05; identified lecture survey workflow with real identity, authorization, persistence and verification.
- S2: F-06 identity/answer separation, no owner-facing anonymous raw text and per-question quantitative privacy; F-07 starter/reuse/choice/subsets; F-08 aggregate CSV. Text collection/storage must be agreed before F-06.
- S3: F-09 compatible lecture trends and per-metric Course/own-instructor summaries; F-10 simple private issue/action notes with status/timestamps/revision, without detailed history or reversal workflow.
- Course → Section → Lecture is academic context; Survey is the evaluation instrument and Results are derived. No attendance/grades/LMS, instructor ranking or shared-note publishing is included.

## What is not provided by this planning PR

Issue [#5](https://github.com/Maibokdaimhai/LECTRA/issues/5) has merged shared/F-01/F-02/F-03/F-05 documentation and a new local F-04 draft. Each feature still requires its applicable accepted interface/schema/AC/STS agreement before code; F-04 review and complete shared traceability remain pending. Issue [#6](https://github.com/Maibokdaimhai/LECTRA/issues/6) has a merged evidence/PDF plan; actual Part F requires observed domain tests/demonstrations, substantive teammate reviews and an accepted product release. #15 tooling results do not complete those product outcomes.

The root README now documents actual #15 tooling install/config/run/build/test commands and a disposable DB probe. Product migrations/seed, domain demos and clean-checkout teammate reproduction remain #16/#24; do not infer a runnable Sprint 1 product from this tooling setup.

## Maintaining this baseline

Keep existing requirement/feature IDs stable, append new IDs, and record the impact of accepted changes in the decision log. Before a feature is coded, version its contract and test design. After execution, extend traceability with actual test IDs/files/results/commits rather than replacing plans with unsupported completion claims. Obtain real teammate review; the AI-assisted audit is not a substitute.

Issue #5 owns detailed Sprint 1 API/database/UI contracts, AC/STS/DoD and actual bounded task allocation; do not require this planning PR to supply those implementation contracts. Coarse workload estimates remain provisional. The four review recommendations are now identified as Section 8 Innovation Opportunities: Keep P10/P05, Simplify P14 with sharing deferred, Incorporate P15 into existing SYS-04/S3 QA. REV-08 belongs to the separate Initial Review. The teammate's full original reports are not directly accessible; source attribution uses the owner's clarification, and OPEN-11 records the verification limit rather than claiming the reports are repository files.

- [Working increment and selected actual verification](sprints/sprint-1/implementation-evidence.md) - review candidate, not accepted release.
