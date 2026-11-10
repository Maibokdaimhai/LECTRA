# Sprint 1 release readiness — Issue #25

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

The current staging graph contains both PR #38 and PR #37: merge `4ff4562` has parents `60736fb` (PR #38 integration) and `b024596` (PR #37 head). Earlier PR base fields alone must not be used to infer missing integration. A later documentation-only commit can identify its own evidence revision while retaining the exact tested application/source version.

PR #39 received [R1NNE0's approval](https://github.com/Maibokdaimhai/LECTRA/pull/39#pullrequestreview-5842618558) at `2026-11-10T20:24:41Z` on source `2801003c1ef292fa90c5190dd89ac0325e40d582` and merged at `2026-11-10T20:25:00Z` as `b5f6d67eab20aece3307cdad03b41f840cc6a8d5`. That merge is the documentation/readiness integration point; it is not the source on which the historical 138-test matrix was executed.

## Actual integrated candidate verification

A new GitHub clone at the exact staging SHA installed the lockfile and generated its own private configuration. Node 24.22.1, npm 10.9.2 and PostgreSQL 17.11 were observed. Separate new demo/API/foundation/browser databases were used. The original user demo service/data was not reused or changed.

- **138 selected automated tests passed**, with no final failures/skips: 37 unit, 2 API liveness, 32 real API/PostgreSQL, 9 foundation, 2 PostgreSQL tooling, 38 isolated HTTP/browser regressions, 14 real web/API/PostgreSQL browser executions and 4 inherited smoke executions.
- Typecheck/build, real Prisma adapter compatibility and the actual built-API process restart passed.
- A separate `npm run demo` system demonstration exercised private owner/student login, owned Draft/save/publication, missing-required 422, persisted response/readback/relogin, repeat-submission 409, Published count-only, Closed mean/count and foreign-owner/ineligible 404. Those observations are not added to the runner test total.
- Actual application stop/start **and** named-volume PostgreSQL container stop/start preserved sessions/deadline, questionnaire, saved answers and summary without migration/reseed between starts. This is not a production backup/restore claim.
- Existing config/demo files were refused on a second setup/config invocation with their hashes unchanged and mode 0600. Repeat seed before fixture changes succeeded without replacing the fixtures. The early container-bootstrap readiness problem and corrected TCP check are disclosed in the snapshot.

The initial clone/demo observations apply to integrated staging `4ff4562`; the final 138-test matrix applies to readiness-test candidate `037cb3f`. Application runtime is identical across them. Neither is relabelled as post-main results. The source manifest is a consistency aid, not a substitute for the required post-main commands. No application/schema/dependency/browser file is changed. The existing API suite gains only the explicit frozen-discovery assertions and their explanatory comments; the final candidate matrix includes those assertions.

## Gate register

| Gate | Current observation | Remaining action |
| --- | --- | --- |
| G-01: integrated application and actual feature reviews | Actual merged PRs/reviews observed; candidate source and ancestry recorded | Reviewer confirms accepted scope and no new blocking defect. |
| G-02: meaningful integration/system/selected browser checks | Current integrated source passed the checks above | Preserve source/count boundaries; rerun affected checks if any source/configuration changes. |
| G-03: reproducible setup | Complete under the owner-approved author-reproduction route: author/AI-assisted fresh clone verified; R1NNE0 approved PR #39 on source `2801003c1ef292fa90c5190dd89ac0325e40d582`; staging merge `b5f6d67eab20aece3307cdad03b41f840cc6a8d5` recorded | Peer-review and staging-integration dependencies complete. No independent teammate installation is claimed. |
| G-04: applicable AC / Product DoD and remaining gaps | Actual partial coverage, defects/fixes and historical tests are available | Actual release reviewer must resolve or explicitly disposition required uncovered conditions; partial mappings alone do not waive a contract. Record reasons and remaining actions, not a blanket Done claim. |
| G-05: substantive release review | Not yet observed for staging → main | Review PR #40 after G-04 disposition and synchronization with the resulting staging baseline; actual human approval required, no self-approval. |
| G-06: accepted immutable main version and post-main checks | Not performed | Merge only after actual review; record actual SHA, run required checks on it and retain the immutable tag. |
| G-07: assessed PDF / contribution record | Earlier PDF is a pre-review draft | #26 regenerates against actual release and genuine contributions. This gate is not silently marked complete by a release PR. |

PR #39 is approved and merged, completing G-03. PR #40 should remain Draft until G-04 is addressed and its source is updated to the actual resulting staging baseline. Substantive opposite-member release review still precedes main integration. Do not merge a stale snapshot of staging before those accepted changes are included. No automatic release or teammate notification is triggered by these documents.

## Coverage decisions required from actual review

The accepted Product DoD requires observable applicable AC and genuine verification. It does not permit a failed/required not-run condition to be declared Done merely by describing it as a limitation. The [Issue #22 inventory](issue-22-coverage.json) has 113 AC / 183 planned cases, with 104 conservative Partial mappings at its recorded source. The [Issue #23 inventory](issue-23-browser-coverage.json) adds selected UI evidence at its own source; do not add mapping counts as if they were distinct tests or infer complete AC acceptance.

| Area | Known boundary / reviewer decision |
| --- | --- |
| Frozen membership in **discovery** | TEST-F02-I10 / AC-F02-08 has no direct #22 mapping after the honest PR #37 correction. Detail/submission eligibility checks do not substitute for discovery after enrollment changes. The [readiness coverage addendum](release-coverage-addendum.json) records that the current candidate extends INT22-02 with explicit list assertions after those membership changes. Its exact source and observed result are recorded in setup-verification.json and that addendum; do not retroactively alter #22's older source-bound inventory. |
| Exhaustive auth/failure profiles | Selected real expiry/CSRF/revocation/store checks pass. The entire save/destroy/lookup fault matrix and deployed HTTPS/proxy profile have not all run. Separate local S1 requirements from later deployment checks with actual reasoning. |
| Concurrent snapshot and mutation fault permutations | Core duplicate/rollback/edit/publish/close ordering checks pass. Not every count/items/results snapshot permutation or every F-03 mutation failure stage is demonstrated. Identify any acceptance-critical missing behavior and resolve it. |
| Delivery loss / deadlock / log-spy permutations | Real committed POST delivery loss and blocked recovery are covered, with mocks explicitly separate. This does not establish every lost-commit/deadlock/outage/log-spy condition. |
| UI/manual/process and contributions | Selected keyboard/focus/layout checks pass at 360/1280. Full assistive-technology/zoom or P15 human usability is not certified. Both students must confirm real contributions and understand the work; do not invent pair sessions/hours. |

For each decision record: planned ID/AC, applicability, actual evidence/version, Pass/Fail/Not run/N/A with reason, whether it blocks this release, required fix/check/owner, and the actual reviewer/source. The author/agent cannot invent the teammate's decision. N/A needs an applicable scope explanation and reviewer agreement, not convenience.

## Release execution after actual review

1. Complete the G-04 coverage and Product DoD decisions. Resolve any blocking check/fix and record its corresponding reviewed retest; PR #39 peer review and staging integration are already complete.
2. Update PR #40 to the actual resulting staging baseline, including the PR #39 documentation/readiness integration at `b5f6d67eab20aece3307cdad03b41f840cc6a8d5` and any subsequent accepted G-04 changes. The feature scope remains identified F-01–F-05.
3. Obtain substantive opposite-member review of staging → main before proceeding toward main integration. Record the actual review URL and reviewed SHA. Do not transfer PR #39 or an old feature approval to the release PR.
4. After the authorized reviewed merge, create/use a clean checkout of the **actual merged main SHA**. `git fetch origin main`, `git switch --detach origin/main`, `git rev-parse HEAD` identify it. Record both PR merge SHA and checked-out SHA; do not guess or replace them with a later docs revision.
5. Install the same lockfile and configure new isolated verification databases. Run the README's build/typecheck/unit/API/feature/foundation/DB/ORM/built-process-restart/mock-browser/smoke/real-browser commands on that actual version. Record all commands, failures/skips/counts and safe selected normal/rejection/forbidden evidence. Any code change needs an appropriate reviewed correction and retest; do not preserve a false green result.
6. Once required main checks pass, retain an immutable annotated tag pointing at that exact assessed SHA (proposed name `sprint-1`, first verify it is unused; never move an existing tag). Record the actual tag target and publication result. No tag exists merely because this name is proposed.
7. Keep assessed code SHA/tag distinct from any later report/evidence commit. #26 consumes actual release checks, real reviews/integration/board state, current safe screenshots and confirmed contributions, then renders/inspects the final PDF. No submission or deadline-compliance claim is made here.

## Selected current candidate figures

[Closed results, wide](release-candidate-evidence/closed-results-wide.png) · [Closed rejection recovered, narrow](release-candidate-evidence/closed-rejection-recovered-narrow.png) · [Foreign-owner safe list, narrow](release-candidate-evidence/foreign-owner-safe-list-narrow.png). These are actual candidate captures; the test assertions/API results establish rejection and persistence, not a screenshot alone. Their exact provenance/hashes are in setup-verification.json.

## Current disposition

#24: setup verification and documentation completed under the owner-approved author-reproduction route; R1NNE0 approved PR #39, and it merged into staging as `b5f6d67eab20aece3307cdad03b41f840cc6a8d5`. No independent teammate installation is claimed. #25 remains open pending release acceptance: G-04 coverage/Product DoD decisions, G-05 substantive staging-to-main review, G-06 main merge/immutable tag/post-main verification and G-07 final assessed PDF/contribution record remain pending. The Sprint 1 release is not complete.
