# Sprint 1 release readiness — Issue #25

**Accepted main release (2026-11-12):** [sprint-1 / main af2e103 with 214 actual post-main passing tests](main-release.md) supersedes earlier pending release observations. [Exact commands/SHA/hash evidence](main-release-verification.json) and [actual human release approval](main-release-review-history.json) retain the assessed application separately from this report revision. Earlier dated sections below are historical, not current open blockers.

**Final MVP correction (2026-11-12):** [Session/logout and exact-lifetime correction](final-session-correction.md) records the three deep-review findings, production fixes, permanent regressions and [208 passing selected tests on the final code commit](final-session-verification.json), plus build/typecheck/ORM/restart. Actual correction integration, teammate release approval and post-main/tag steps remain required; earlier records below retain their original sources.

**Current staging base (2026-11-12):** `fa33e4cc2b57e5c140ffca892e507814b436829d` includes reviewed/merged PR #42 and PR #43. Final closure reproduced Major **DEF-G04-01**: a checked-out PostgreSQL client could emit an uncaught error after physical COMMIT acknowledgement loss. The bounded transaction-helper fix is verified in the uncommitted working tree, with [49 selected passing post-fix executions](g04-final-verification.json), typecheck/build and no uncaught errors. **Do not approve unchanged `fa33e4c` for main.** Actual review/integration of this correction, G-04 acceptance and substantive #40 approval remain pending. Historical 138/144 and PR #43 results retain their original sources/counts.

Prepared 2026-11-10; evidence/readiness updated 2026-11-11. Integrated pre-release source: `4ff4562a8cf1a58fa5c6ae1d958b4ab8c0b2e18f` on staging. Readiness-test candidate: `037cb3f69db4b37b8363b9f4bdca9c277d02624c`, adding direct frozen-discovery list assertions on that integrated baseline. This is a **release candidate record, not an accepted main release**. The project owner authorized preparing #24/#25; actual opposite-member review still precedes main integration. No main merge, tag or post-main test result is recorded by this document.

## Source and review traceability

Actual GitHub PR/review/merge metadata is retained in [release history](release-history.json). It records actors and versions, not inferred effort/hours or personal availability.

| Package | Actual integration / evidence |
| --- | --- |
| Product baseline / Parts A–D | PR #7. Instructor PDFs remain authority; numeric limits, privacy/UI policies and later feature choices are team designs. |
| Delivery workflow / evidence plan | PRs #27/#28/#30. Issue #8 stays the overall delivery umbrella. |
| Preimplementation Part E contracts | PR #29 shared/F-01, #31 F-02, #32 F-03, #33 F-05, #34 F-04/tooling. Recorded actual reviews precede the applicable feature implementation. |
| Schema/migrations/synthetic seed | PR #35, source `6e80fa0`, real migration/constraint/seed review. |
| Integrated F-01–F-05 application | PR #36, including original and second-pass corrections and actual final approval. |
| Cross-feature API/PostgreSQL verification | PR #37, including corrected unsupported evidence mapping; [its source-bound record](issue-22-api-verification.md). |
| Real browser journeys / Closed recovery fix | PR #38; [its source-bound record](issue-23-browser-verification.md). |
| Current setup and candidate checks | PR #39; [fresh setup](setup-and-handoff.md), [actual command/results/manifest](setup-verification.json). R1NNE0 approved source `2801003c1ef292fa90c5190dd89ac0325e40d582`; merged into staging as `b5f6d67eab20aece3307cdad03b41f840cc6a8d5`. |
| Authentication persistence correction | PR #42, author Maibokdaimhai; [R1NNE0 approved](https://github.com/Maibokdaimhai/LECTRA/pull/42#pullrequestreview-5863694268) head `4f25a153ba505eb95345971fee68e94195366a94` at `2026-11-11T18:35:56Z`; merged as `2961014e6b21668f20321e0acade382e67972f1a` at `2026-11-11T18:36:06Z`. Actual correction test source remains `cccb1c0`; full matrix author-reported, 10 focused PostgreSQL checks reviewer-reported. |
| UI focus/validation correction | PR #43, author R1NNE0; [Maibokdaimhai approved](https://github.com/Maibokdaimhai/LECTRA/pull/43#pullrequestreview-5871353742) `b75bf35210d5375ef3e48f3e74d943ccb7f8f5f1` at `2026-11-12T08:27:41Z`; merged as `fa33e4cc2b57e5c140ffca892e507814b436829d` at `2026-11-12T08:27:47Z`. Actual hash-tested source and limitations remain in its own evidence record. |
| Final transaction connection-loss correction | DEF-G04-01, working-tree patch on `fa33e4c`; two explicit failing-before regressions, seven passing-after targeted tests, 38 API/PostgreSQL neighbors and four selected real browser journeys. Actual correction review/integration is pending; no PR or approval is invented. |

The current staging graph contains both PR #38 and PR #37: merge `4ff4562` has parents `60736fb` (PR #38 integration) and `b024596` (PR #37 head). Earlier PR base fields alone must not be used to infer missing integration. A later documentation-only commit can identify its own evidence revision while retaining the exact tested application/source version.

PR #39 received [R1NNE0's approval](https://github.com/Maibokdaimhai/LECTRA/pull/39#pullrequestreview-5848796940) at `2026-11-10T20:24:41Z` on source `2801003c1ef292fa90c5190dd89ac0325e40d582` and merged at `2026-11-10T20:25:00Z` as `b5f6d67eab20aece3307cdad03b41f840cc6a8d5`. That merge is the documentation/readiness integration point; it is not the source on which the historical 138-test matrix was executed.

## Actual integrated candidate verification

A new GitHub clone at the exact staging SHA installed the lockfile and generated its own private configuration. Node 24.22.1, npm 10.9.2 and PostgreSQL 17.11 were observed. Separate new demo/API/foundation/browser databases were used. The original user demo service/data was not reused or changed.

- **138 selected automated tests passed**, with no final failures/skips: 37 unit, 2 API liveness, 32 real API/PostgreSQL, 9 foundation, 2 PostgreSQL tooling, 38 isolated HTTP/browser regressions, 14 real web/API/PostgreSQL browser executions and 4 inherited smoke executions.
- Typecheck/build, real Prisma adapter compatibility and the actual built-API process restart passed.
- A separate `npm run demo` system demonstration exercised private owner/student login, owned Draft/save/publication, missing-required 422, persisted response/readback/relogin, repeat-submission 409, Published count-only, Closed mean/count and foreign-owner/ineligible 404. Those observations are not added to the runner test total.
- Actual application stop/start **and** named-volume PostgreSQL container stop/start preserved sessions/deadline, questionnaire, saved answers and summary without migration/reseed between starts. This is not a production backup/restore claim.
- Existing config/demo files were refused on a second setup/config invocation with their hashes unchanged and mode 0600. Repeat seed before fixture changes succeeded without replacing the fixtures. The early container-bootstrap readiness problem and corrected TCP check are disclosed in the snapshot.

The initial clone/demo observations apply to integrated staging `4ff4562`; the final 138-test matrix applies to readiness-test candidate `037cb3f`. Application runtime is identical across them. Neither is relabelled as post-main results. The source manifest is a consistency aid, not a substitute for the required post-main commands. No application/schema/dependency/browser file is changed. The existing API suite gains only the explicit frozen-discovery assertions and their explanatory comments; the final candidate matrix includes those assertions.

## Gate register

Historical evidence transfer to base `fa33e4c`: [recovered supplementary record](g04-supplementary-verification.json) retains 12 actual passes on `2961014`; relevant backend/schema/configuration was unchanged at the base. [PR #43 evidence](pr40-ui-accessibility-verification.json) retains 41/74/22/4 and eight screenshots at its actual source. After DEF-G04-01's working-tree patch, one backend file differs among those 76 hashes (75 still match); frontend/fixtures/configuration and screenshots are unchanged. Four real browser journeys were selectively rerun for the backend integration, not the full UI matrix. The prior recovery ran no application tests; the separate final closure did. Do not combine the historical matrices, recovered 12 and final 49 into a purported distinct-test count.

Final closure commands/results and all 79 production/test/configuration hashes are in [g04-final-verification.json](g04-final-verification.json). `npm run typecheck` and `npm run build` pass; the new `vitest.release.config.ts` suite passes 7/7, the existing feature suite 38/38, and B23-01/B23-03 at two widths 4/4. Final failures/skips/uncaught errors are zero. The initial run's seven passing assertions plus two uncaught errors exited 1 and is preserved as failure history, followed by two explicit RED failures (five unselected skips). All runs used newly created allowlisted databases/clusters; SQL fixtures and services were cleaned up. No historical result is rewritten.

| Gate | Current observation | Remaining action |
| --- | --- | --- |
| G-01: integrated application and actual feature reviews | Actual feature/#42/#43 approvals and base `fa33e4c` verified; later DEF-G04-01 fix verified in working tree | Owner obtains actual correction review/integration and identifies resulting staging SHA; earlier approvals do not cover it or approve #40. |
| G-02: meaningful integration/system/selected browser checks | Historical evidence plus recovered checks and final 49 selected post-fix executions; relevant source differences recorded | Preserve source/count boundaries. Verify the actual integrated patch matches final hashes; rerun only if integration changes relevant implementation/configuration. |
| G-03: reproducible setup | Complete under the owner-approved author-reproduction route: author/AI-assisted fresh clone verified; R1NNE0 approved PR #39 on source `2801003c1ef292fa90c5190dd89ac0325e40d582`; staging merge `b5f6d67eab20aece3307cdad03b41f840cc6a8d5` recorded | Peer-review and staging-integration dependencies complete. No independent teammate installation is claimed. |
| G-04: applicable AC / Product DoD and remaining gaps | Evidence assembled and DEF-G04-01 fixed in tested working tree; canonical A–G/DoD proposals preserve Partial/Not run limits | Actual correction review/integration plus human local acceptance pending. No known additional defect in tested tree; unchanged base still needs the fix. No blanket Done/full STS Pass. |
| G-05: substantive release review | Not yet observed for staging → main | Review PR #40 after G-04 disposition and synchronization with the resulting staging baseline; actual human approval required, no self-approval. |
| G-06: accepted immutable main version and post-main checks | Not performed | Merge only after actual review; record actual SHA, run required checks on it and retain the immutable tag. |
| G-07: assessed PDF / contribution record | Earlier PDF is a pre-review draft | #26 regenerates against actual release and genuine contributions. This gate is not silently marked complete by a release PR. |

PR #39 is approved and merged, completing G-03. PR #40 is open at base `fa33e4c`, which still contains the reproduced DEF-G04-01. The owner must review/integrate the prepared production correction and identify the resulting source/evidence revision before release approval. G-04 decisions and actual opposite-member approval still precede main integration. No state-changing Git operation, automatic release or teammate notification is performed by this package.

## Coverage decisions required from actual review

The accepted Product DoD requires observable applicable AC and genuine verification. It does not permit a failed/required not-run condition to be declared Done merely by describing it as a limitation. The [Issue #22 inventory](issue-22-coverage.json) has 113 AC / 183 planned cases, with 104 conservative Partial mappings at its recorded source. The [Issue #23 inventory](issue-23-browser-coverage.json) adds selected UI evidence at its own source; do not add mapping counts as if they were distinct tests or infer complete AC acceptance.

| Area | Known boundary / reviewer decision |
| --- | --- |
| Frozen membership in **discovery** | TEST-F02-I10 / AC-F02-08 has no direct #22 mapping after the honest PR #37 correction. Detail/submission eligibility checks do not substitute for discovery after enrollment changes. The [readiness coverage addendum](release-coverage-addendum.json) records that the current candidate extends INT22-02 with explicit list assertions after those membership changes. Its exact source and observed result are recorded in setup-verification.json and that addendum; do not retroactively alter #22's older source-bound inventory. |
| Authentication/failure profiles | #42 and recovered S01 remain applicable; final F01 physically loses authenticated UPSERT acknowledgement after real commit and proves no issued usable cookie or resave. Exhaustive verifier/wire timing permutations remain Partial, not newly certified. |
| Concurrent snapshot and mutation fault permutations | Recovered S02–S09 retain actual replacement/publication/delete rollback and read barriers. Final F02 adds create rollback; F03 adds physical Draft COMMIT loss. SQL/isolation mechanisms remain unchanged; revised client error lifecycle and affected routes are retested. Every statement/permutation is not certified. |
| Delivery loss / deadlock / log-spy permutations | HTTP delivery loss and actual lock timeout remain separate. Final F03/F04 are physical database COMMIT acknowledgement loss; F05 is an actual generated deadlock; F06 injects 40001, not native SSI write skew. Original S11 remains code injection. F07 positively exercises the fixed pool logger; original S12 remains zero-entry evidence. Full logger/transport permutations are not certified. |
| UI/manual/process and contributions | #43 resolves UI-F01–F03 with 320px and genuine Chromium 200% zoom evidence, alongside 360/1280 checks. Full human screen-reader/WCAG testing remains Not run. P15 remains later work. Both students still confirm actual contributions/understanding; no pair sessions/hours are invented. |

For each decision record: planned ID/AC, applicability, actual evidence/version, Pass/Fail/Not run/N/A with reason, whether it blocks this release, required fix/check/owner, and the actual reviewer/source. The author/agent cannot invent the teammate's decision. N/A needs an applicable scope explanation and reviewer agreement, not convenience.

## Release execution after actual review

1. Obtain actual review/integration of DEF-G04-01's verified patch/tests/evidence, then actual G-04 acceptance of the A–G and DOD-01–11 proposals. Resolve any specifically rejected boundary. PR #39/#42/#43 approvals do not approve the new correction or this release.
2. Identify #40's actual resulting staging SHA containing the fix; `fa33e4c` is the old base, not the corrected release. Verify correspondence to final source hashes. Use the [prepared manual PR description](pr40-release-description.md); do not relabel historical execution sources. Scope remains identified F-01–F-05.
3. Obtain substantive opposite-member review of staging → main before proceeding toward main integration. Record the actual review URL and reviewed SHA. Do not transfer PR #39 or an old feature approval to the release PR.
4. After the authorized reviewed merge, create/use a clean checkout of the **actual merged main SHA**. `git fetch origin main`, `git switch --detach origin/main`, `git rev-parse HEAD` identify it. Record both PR merge SHA and checked-out SHA; do not guess or replace them with a later docs revision.
5. Install the same lockfile and configure new isolated verification databases. Run the README's required checks on that actual version, plus `node node_modules/vitest/vitest.mjs run --config vitest.release.config.ts` with a **separate new empty allowlisted database** and matching `ALLOW_RELEASE_TESTS`. Existing feature/browser preparation also requires its own fresh target. Record all commands, failures/skips/counts and safe selected normal/rejection/forbidden evidence. Any code change needs appropriate reviewed retesting; do not preserve a false green result.
6. Once required main checks pass, retain an immutable annotated tag pointing at that exact assessed SHA (proposed name `sprint-1`, first verify it is unused; never move an existing tag). Record the actual tag target and publication result. No tag exists merely because this name is proposed.
7. Keep assessed code SHA/tag distinct from any later report/evidence commit. #26 consumes actual release checks, real reviews/integration/board state, current safe screenshots and confirmed contributions, then renders/inspects the final PDF. No submission or deadline-compliance claim is made here.

## Selected current candidate figures

[Closed results, wide](release-candidate-evidence/closed-results-wide.png) · [Closed rejection recovered, narrow](release-candidate-evidence/closed-rejection-recovered-narrow.png) · [Foreign-owner safe list, narrow](release-candidate-evidence/foreign-owner-safe-list-narrow.png). These are actual candidate captures; the test assertions/API results establish rejection and persistence, not a screenshot alone. Their exact provenance/hashes are in setup-verification.json.

## Current disposition

#24: setup verification and documentation completed under the owner-approved author-reproduction route; R1NNE0 approved PR #39, and it merged into staging as `b5f6d67eab20aece3307cdad03b41f840cc6a8d5`. No independent teammate installation is claimed. #25 remains open pending accepted G-04 coverage/Product DoD decisions, G-05 substantive release review, authorized staging-to-main integration, verification on the actual main commit and immutable release SHA/tag evidence under G-06. G-04, G-05 and G-06 remain pending. #26 separately owns the final Deliverable 1 PDF and final contribution/report evidence. G-07 remains pending for overall Deliverable 1 readiness, but does not block closing #25 once its own release criteria are complete. Neither the Sprint 1 release nor the final report is complete.
