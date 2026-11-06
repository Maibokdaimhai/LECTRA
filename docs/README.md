# LECTRA — Engineering Documentation Index

Status: revised planning baseline for PR [#7](https://github.com/Maibokdaimhai/LECTRA/pull/7). The application is not implemented. This index does not replace the assessed self-contained PDF or the eventual root README setup instructions.

## Read in this order

| Document | Purpose | Deliverable / issue |
| --- | --- | --- |
| [SRS](srs.md) | Problem, actors, scope, glossary, stable FR/BR/NFR, business states, starter content and privacy boundaries. | Part A / #1 |
| [Decision log](decisions.md) | Owner direction versus selected designs/deferred proposals; review gates and revision rationale. | Supports A–D / #1–4 |
| [Feature inventory](features.md) | F-01–F-10, dependencies, completion boundaries and system responsibilities. | Part B / #2 |
| [Traceability](traceability.md) | 46 requirements mapped to features, sprints and planned verification; instructor-theme cross-check. | Part B / #2 |
| [System SDS](system-sds.md) | Architecture, data, transactions, identity/access, UI theme, API conventions, starter/history/notes, delivery and verification design. | Part C / #3 |
| [Three-sprint plan](sprints/plan.md) | Sprint outcomes, timing, lab overlap, two-person rotation, risks and implementation/release gates. | Part D / #4 |
| [Baseline review](baseline-review.md) | Audit findings, proposal disposition, instructor requirement coverage and remaining work. | Planning review, not teammate approval or Part F evidence |

## Current scope at a glance

- S1: F-01–05; identified lecture survey workflow with real identity, authorization, persistence and verification.
- S2: F-06 anonymous, F-07 starter/question reuse/choice/subset expansion, F-08 aggregate CSV.
- S3: F-09 owned compatible lecture history/trends, F-10 private Teaching Improvement Notes, final integration and verification.
- Course → Section → Lecture is academic context; Survey is the evaluation instrument and Results are derived. No attendance/grades/LMS, instructor ranking or shared-note publishing is included.

## What is not provided by this planning PR

Issue [#5](https://github.com/Maibokdaimhai/LECTRA/issues/5) still needs the feature-level Sprint 1 design/UI/API/data contracts, AC, STS and Product DoD before implementation. Issue [#6](https://github.com/Maibokdaimhai/LECTRA/issues/6) prepares the evidence/PDF outline; actual Part F requires observed application tests, demonstrations, substantive teammate reviews and an accepted release. No contract, PASS result, contribution or approval may be inferred from these plans.

The root README is intentionally still the initial empty file. It must become a real dependency/configuration/migrate/seed/run/build/test guide when those commands exist, before the Sprint 1 release; do not invent working commands in a planning-only document.

## Maintaining this baseline

Keep existing requirement/feature IDs stable, append new IDs, and record the impact of accepted changes in the decision log. Before a feature is coded, version its contract and test design. After execution, extend traceability with actual test IDs/files/results/commits rather than replacing plans with unsupported completion claims. Obtain real teammate review; the AI-assisted audit is not a substitute.
