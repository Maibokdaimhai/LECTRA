# Sprint 1 — Delivery Tracker and Acceptance Readiness

Related issue: [#8](https://github.com/Maibokdaimhai/LECTRA/issues/8). Status: tracking setup in progress; Sprint 1 is not complete.

## 1. Authority, baseline and snapshot

- Product baseline: PR [#7](https://github.com/Maibokdaimhai/LECTRA/pull/7) merged into `staging` at `333a9fc6a6a2905b07087c98eb5f5d931ffec107`.
- Working branch for this bounded change: `docs/8-sprint1-readiness-tracker`, created from the updated staging baseline. This branch contains no application implementation and is not a release.
- Repository sources: [SRS](../../srs.md), [features](../../features.md), [traceability](../../traceability.md), [System SDS](../../system-sds.md), [sprint plan](../plan.md), and [decision log](../../decisions.md). The two instructor PDFs remain assignment authority; this tracker adds no product requirement or feature ID.
- GitHub milestone: [Sprint 1 — Deliverable 1](https://github.com/Maibokdaimhai/LECTRA/milestone/1). Deadline: **8 November 2026, 23:59 Asia/Bangkok**.
- Issue-state/assignee snapshot observed: **2026-11-06T21:32:00+07:00**. This is a dated observation, not a live synchronized board or proof of implementation.

Observed planning setup: 21 Sprint 1 issues, all Open and assigned. Eight individual leads per member plus five shared issues do not imply equal effort or confirmed availability. The repository contains the merged planning documents and empty initial README; no S1 application, contracts, migrations or executed application tests were found at inspection. No runtime test, human approval or assessed release is claimed.

## 2. Current backlog and ownership

The table preserves actual issue state separately from evidence. An Open issue is not automatically unstarted, and a Closed issue would not prove correctness without its linked evidence.

| Issue | Work package | Current assignee(s) | GitHub state at snapshot | Completion evidence in this tracker |
| --- | --- | --- | --- | --- |
| [#5](https://github.com/Maibokdaimhai/LECTRA/issues/5) | Shared Part E / Product DoD | `Maibokdaimhai`, `R1NNE0` | Open | No completion evidence recorded here. |
| [#6](https://github.com/Maibokdaimhai/LECTRA/issues/6) | Evidence planning | `Maibokdaimhai`, `R1NNE0` | Open | No completion evidence recorded here. |
| [#8](https://github.com/Maibokdaimhai/LECTRA/issues/8) | Delivery tracker | `Maibokdaimhai`, `R1NNE0` | Open | No completion evidence recorded here. |
| [#9](https://github.com/Maibokdaimhai/LECTRA/issues/9) | Board / review workflow | `Maibokdaimhai` | Open | No completion evidence recorded here. |
| [#10](https://github.com/Maibokdaimhai/LECTRA/issues/10) | F-01 contract | `Maibokdaimhai` | Open | No completion evidence recorded here. |
| [#11](https://github.com/Maibokdaimhai/LECTRA/issues/11) | F-02 contract | `R1NNE0` | Open | No completion evidence recorded here. |
| [#12](https://github.com/Maibokdaimhai/LECTRA/issues/12) | F-03 contract | `R1NNE0` | Open | No completion evidence recorded here. |
| [#13](https://github.com/Maibokdaimhai/LECTRA/issues/13) | F-04 contract | `Maibokdaimhai` | Open | No completion evidence recorded here. |
| [#14](https://github.com/Maibokdaimhai/LECTRA/issues/14) | F-05 contract | `R1NNE0` | Open | No completion evidence recorded here. |
| [#15](https://github.com/Maibokdaimhai/LECTRA/issues/15) | Workspace / verification tooling | `Maibokdaimhai` | Open | No completion evidence recorded here. |
| [#16](https://github.com/Maibokdaimhai/LECTRA/issues/16) | Schema / migrations / seed | `R1NNE0` | Open | No completion evidence recorded here. |
| [#17](https://github.com/Maibokdaimhai/LECTRA/issues/17) | F-01 implementation | `Maibokdaimhai` | Open | No completion evidence recorded here. |
| [#18](https://github.com/Maibokdaimhai/LECTRA/issues/18) | F-02 implementation | `R1NNE0` | Open | No completion evidence recorded here. |
| [#19](https://github.com/Maibokdaimhai/LECTRA/issues/19) | F-03 implementation | `R1NNE0` | Open | No completion evidence recorded here. |
| [#20](https://github.com/Maibokdaimhai/LECTRA/issues/20) | F-04 implementation | `Maibokdaimhai` | Open | No completion evidence recorded here. |
| [#21](https://github.com/Maibokdaimhai/LECTRA/issues/21) | F-05 implementation | `R1NNE0` | Open | No completion evidence recorded here. |
| [#22](https://github.com/Maibokdaimhai/LECTRA/issues/22) | Integrated API/DB/security checks | `Maibokdaimhai` | Open | No completion evidence recorded here. |
| [#23](https://github.com/Maibokdaimhai/LECTRA/issues/23) | Selected browser/E2E checks | `R1NNE0` | Open | No completion evidence recorded here. |
| [#24](https://github.com/Maibokdaimhai/LECTRA/issues/24) | Reproducible README | `Maibokdaimhai` | Open | No completion evidence recorded here. |
| [#25](https://github.com/Maibokdaimhai/LECTRA/issues/25) | Reviewed release / verification | `Maibokdaimhai`, `R1NNE0` | Open | No completion evidence recorded here. |
| [#26](https://github.com/Maibokdaimhai/LECTRA/issues/26) | Actual evidence / final PDF | `Maibokdaimhai`, `R1NNE0` | Open | No completion evidence recorded here. |

Each individual lead owns relevant design/contracts, code, tests and documents, with the other member as planned reviewer. Shared items require a bounded actual author/coordinator and the other reviewer for each change. Planned reviewer or shared assignment does not mean a review happened. Real availability and small task estimates are confirmed during #5 planning, not invented in this table.

## 3. What can start and what must wait

### Planning-ready now

- #5: establish shared Product DoD, stable AC/test naming, interface/schema/security consistency and concrete bounded author/reviewer allocation.
- #10–#14: prepare F-01–F-05 contracts from the merged baseline. Each needs substantive review and an actual recorded version before its feature code. These contract drafts do not need an application to exist first.
- #6: plan evidence capture in parallel; do not wait for all implementation to finish before recording TDD, commands, versions and reviews.
- #9: prepare/use the actual project board and teammate-review workflow. This tracker does not claim that a board has been configured.
- #15: plan workspace/setup checks from the System SDS, then perform only the separately authorized setup work. A setup plan is not a completed feature contract or installed toolchain.

### Execution gates and dependency order

| Work | Inputs / completion gates | What may proceed before those gates finish |
| --- | --- | --- |
| #16 initial User/session database foundation | Working #15 setup, reviewed/versioned #10 User/session design and shared conventions/DoD under #5. No #11–#14 or full #16 closure gate for this subset. | Schema/fixture planning and review before these inputs; once ready, migrate/test only the accepted User/session subset and synthetic login accounts. |
| #16 subsequent domain migrations and full completion | Each context/survey/response/results schema increment needs its applicable reviewed #11–#14 contract and cross-feature consistency under #5. All required S1 schema/seed/constraints/checks are needed before #16 itself is complete. | Draft domain designs independently; no implementation of unreviewed domain rules or claim that the initial auth subset completes #16. |
| #17 F-01 | Reviewed/versioned #10, accepted shared conventions/DoD, working #15 and verified #16 User/session subset. Full #16 completion and unrelated #11–#14 contracts are not prerequisites. | Intended-behavior test design after contract recording; no premature feature implementation/verification claims. |
| #18 F-02 | Reviewed/versioned #11; #17 trusted identity and #16 context seed. | Context/access case design and UI specification. |
| #19 F-03 | Reviewed/versioned #12; #17/#18 identity/context and #16 constraints. | State/validation test design, including Draft-edit/publication races. |
| #20 F-04 | Reviewed/versioned #13; #17–#19; database uniqueness/transaction rules. | Rule tests after contract recording; no late reconstruction of failing-before evidence. |
| #21 F-05 | Reviewed/versioned #14; persisted lifecycle/answers from #19/#20. | Calculation fixture and result-projection test design. |
| #22/#23 final integrated runs | Actual integrated #17–#21, safe real PostgreSQL fixtures and agreed AC/STS. | Write applicable tests early; these final checks do not replace feature-level TDD. |
| #24 verified README | Actual scripts/config/migrations/seed and working feature journey. | Outline documentation; never invent runnable commands. |
| #25 release | #9 workflow, actual #22/#23 results, #24 reproduction and fulfilled DoD; separately authorized reviewed release actions. | Review the readiness checklist; no merge/tag/release authorization from this tracker. |
| #26 PDF | #5 contracts, #6 evidence plan, actual application/review/test evidence and #25 immutable assessed release. | Capture and organize evidence when it occurs, then assemble readable final A–F content. |

Critical path: shared setup and reviewed User/session subset → identity; reviewed context/domain schema increments → context/publication → response transaction → results → integrated verification/review → accepted release → assessed PDF. #16 is an incrementally delivered foundation Issue, not a requirement to finish every domain contract before authentication can start. Keep one additive migration history; verify each accepted subset and do not mark the full Issue complete early. Work on contract/evidence plans can overlap; a teammate's review time is a real dependency. Future features F-06–F-10, anonymous collection, starter/export/history/notes and Lab 5–7 completion are not added to S1.

## 4. Readiness gates — evidence required before marking complete

| Gate | Required observed evidence | Current status |
| --- | --- | --- |
| Planning baseline | Merged baseline reference, linked requirements/design and scoped issues. | Baseline merge and issue allocation observed; not proof of human review or code completion. |
| Part E / feature start | Reviewed/versioned feature design, UI/API/data contracts, AC/STS and Product DoD before each feature implementation. | Missing from inspected repository; #5 and #10–#14 remain Open. |
| Working domain increment | Actual owner create/publish → eligible student submit/readback → owner close/results through UI/API/PostgreSQL. | Not implemented/verified at inspection. |
| Business/access/persistence | Meaningful unit tests; real API/DB permission/rollback/concurrency checks; selected E2E; restart readback and observed results. | Not run; no pass/coverage claim. |
| Reviewed integration | Real Issue/contract/branch/PR links, substantive opposite-member review and staging integration. | Feature review/integration evidence not recorded here. |
| Release | Authorized reviewed staging→main release; actual accepted SHA/tag and build/test output on that SHA. | Not achieved; planning merge is not the S1 release. |
| Deliverable 1 PDF | Complete A–E plus actual F evidence, team identity/contributions, navigation pages, limitations and immutable release reference. | Not assembled or submitted. |

Issue #8 stays Open until its full completion boundary is evidenced. Finishing this tracking document or assigning every issue is only tracking setup, not Sprint 1 acceptance. Do not check product/test/release boxes based on an AI statement or issue count.

## 5. Evidence-recording fields

For every completed AC/check, link the actual `feature/requirement → AC → planned test → test file/name/level → command or run → tested SHA → observed PASS/FAIL/SKIP → evidence location`. Record manual checks separately. Use Not specified/Not run while details or execution do not exist; do not create placeholder PASS entries.

For meaningful TDD, retain the actual intended-behavior failure before correction and passing output afterward with their versions. For a completed work package, record Issue, branch, PR author, actual reviewer, substantive review reference, integrated commit and any real pair contribution. Do not infer review from merge alone.

Capture PDF demonstrations on the stated assessed release: normal journey and persisted readback, meaningful rejection, login/logout and forbidden backend operation, with role/preconditions/steps/expected/actual and feature/AC references. Final evidence needs the actual two sampled test excerpts, two completed Issues/PRs, board state and both students' contributions required by the handout. Keep safe demo setup and all failed/skipped/incomplete work visible.

## 6. Update and close-out rules

1. Refresh issue/board state and evidence links after actual work or integration; keep snapshot date and source/version clear. Do not silently rewrite historical test versions.
2. Verify the issue's own AC/DoD and linked results before marking Done. Investigate mismatches such as Closed-with-no-evidence instead of treating state as correctness.
3. Keep #5 the Part E umbrella and #6 the evidence plan. Use #26 for final actual evidence/PDF, without inventing a second Part F.
4. Changes to product scope/requirements require normal decision/traceability/contract updates. This tracker does not override source policy, create approvals or authorize further implementation/Git/release actions.
5. Before closing #8, both students inspect the completed gates and the released application's actual evidence. Release/PDF completion and known limitations must be explicit; obtain real review rather than auto-closing from task-list progress.

## 7. Immediate handoff

Next bounded product work is #5 shared contract/DoD conventions and the appropriate feature contract, for example #10 (F-01, lead Maibokdaimhai; planned reviewer R1NNE0). The other member can draft #11/#12/#14 under the agreed allocation, while #6 plans evidence. The owner authorized committing/pushing this bounded tracker change and opening its PR into staging. Publication does not implement or close any child task, prove teammate approval or authorize a release; use the actual Git/PR history for publication evidence.
