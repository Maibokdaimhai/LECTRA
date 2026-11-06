# LECTRA — Engineering Documentation Index

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
| [Baseline review](baseline-review.md) | BASE-01–08, PD-01–03, individually dispositioned Section 8 P10/P05/P14/P15, separate Initial Review REV-08 and source limitations. | Planning review, not teammate approval or Part F evidence |
| [Deliverable 1 evidence plan](deliverable-1/evidence-plan.md), [PDF outline](deliverable-1/report-outline.md) and [register](deliverable-1/evidence-register.md) | A-F assembly/capture plan, demo specifications, draft AC mappings and unfilled actual-run/review/release/contribution records. | #6 planning only; #26 supplies actual evidence/PDF, no runtime PASS or completed release claimed |

## Current scope at a glance

- S1: F-01–05; identified lecture survey workflow with real identity, authorization, persistence and verification.
- S2: F-06 identity/answer separation, no owner-facing anonymous raw text and per-question quantitative privacy; F-07 starter/reuse/choice/subsets; F-08 aggregate CSV. Text collection/storage must be agreed before F-06.
- S3: F-09 compatible lecture trends and per-metric Course/own-instructor summaries; F-10 simple private issue/action notes with status/timestamps/revision, without detailed history or reversal workflow.
- Course → Section → Lecture is academic context; Survey is the evaluation instrument and Results are derived. No attendance/grades/LMS, instructor ranking or shared-note publishing is included.

## What is not provided by this planning PR

Issue [#5](https://github.com/Maibokdaimhai/LECTRA/issues/5) still needs the feature-level Sprint 1 design/UI/API/data contracts, AC, STS and Product DoD before implementation. Issue [#6](https://github.com/Maibokdaimhai/LECTRA/issues/6) prepares the evidence/PDF outline; actual Part F requires observed application tests, demonstrations, substantive teammate reviews and an accepted release. No contract, PASS result, contribution or approval may be inferred from these plans.

The root README is intentionally still the initial empty file. It must become a real dependency/configuration/migrate/seed/run/build/test guide when those commands exist, before the Sprint 1 release; do not invent working commands in a planning-only document.

## Maintaining this baseline

Keep existing requirement/feature IDs stable, append new IDs, and record the impact of accepted changes in the decision log. Before a feature is coded, version its contract and test design. After execution, extend traceability with actual test IDs/files/results/commits rather than replacing plans with unsupported completion claims. Obtain real teammate review; the AI-assisted audit is not a substitute.

Issue #5 owns detailed Sprint 1 API/database/UI contracts, AC/STS/DoD and actual bounded task allocation; do not require this planning PR to supply those implementation contracts. Coarse workload estimates remain provisional. The four review recommendations are now identified as Section 8 Innovation Opportunities: Keep P10/P05, Simplify P14 with sharing deferred, Incorporate P15 into existing SYS-04/S3 QA. REV-08 belongs to the separate Initial Review. The teammate's full original reports are not directly accessible; source attribution uses the owner's clarification, and OPEN-11 records the verification limit rather than claiming the reports are repository files.
