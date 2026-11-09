# Sprint 1 working increment and evidence

**Second-pass update (2026-11-09):** the actual second review confirms R1–R4 resolved and requests N1–N5. The current corrected candidate is `af36beb600615b318fb6665a11ae9b9944ff3666`; [second-pass dispositions](pr36-second-pass-fixes.md) and [exact verification results](pr36-second-pass-verification.json) supersede earlier current-readiness notes. All 115 selected tests and the listed build/restart checks pass; renewed overall approval remains pending.

**Post-review update (2026-11-09):** R1–R4 from the actual CHANGES_REQUESTED review are addressed in candidate `b094bf9ee3140b90c357f20a20e093020965c727`. See [review fixes and current validation](pr36-review-fixes.md) and [machine-readable results](pr36-review-verification.json). The earlier 75-test report snapshot below remains historical; current selected validation is 97 tests. Renewed human acceptance is still pending.

Prepared 2026-11-09. This is a review candidate for #17-#24, based on the verified database source in PR #35 (`6e80fa0828c8e6e00d604a7cf257cd6e11888da9`). PR #35 is not merged at the recorded check; no teammate implementation approval, integrated staging acceptance, main release, tag or completed PDF submission is claimed. Instructor requirements remain the supplied PDFs; exact session/limit/UI choices come from the accepted LECTRA contracts.

## Implemented candidate

- F-01: actual Argon2id login, server-derived current identity/role, PostgreSQL opaque sessions, SID/CSRF regeneration, absolute guest/auth deadlines, revocation, Origin/CSRF/transport/schema guards and process-local login throttling. Cookie expiry is capped on serialization; the store corrects the upstream whole-second ceiling before acknowledging a save. No automatic session table creation or memory session fallback.
- F-02: scoped Course/Section/Lecture selectors and paginated survey discovery. Canonical Section ownership and frozen eligibility control queries; allowlisted projections exclude other accounts/answers. Pagination uses repeatable-read snapshots and fixed C-collation ordering.
- F-03: Draft creation, revisioned whole-definition save/reorder/delete, publication snapshot and close. Published definitions are immutable. All transitions share a Survey row lock; unique lecture IDs arbitrate concurrent creates.
- F-04: strict rating/text validation, Unicode code-point bounds, no empty submission, one atomic participation/bundle/answer transaction, no automatic POST retry, and persisted own-answer readback. Submit/close share the same Survey lock and bounded native database waits (5-second lock / 10-second statement timeout).
- F-05: owner-only count while Published; Closed exact half-up means, five score bins, actual answered denominators and unlabelled C-ordered plain-text comments. Invalid persisted type/count/range invariants fail closed. No anonymous mode/export/history/notes.
- Web: labelled native controls, memory-only private state, safe React text rendering, cool light theme, explicit loading/empty/error states, save-before-publish, no default rating, retained inputs after validation rejection, unknown-outcome status recovery, private-state clearing and truthful sign-out failure handling. Bootstrap callers are coalesced to prevent StrictMode cookie/token races.

The runtime uses parameterized `pg` SQL for scoped queries and explicit row-lock transactions, alongside the accepted Prisma migration/schema/generated-client foundation. It does not create a competing schema or replace persistent storage with a mock. Additional declaration packages are pinned `@types/express-session@1.19.0` and `@types/connect-pg-simple@7.0.3`; no new runtime service or UI library is added.

## Actual test sources and selected contract coverage

These rows describe selected evidence, not a claim that every planned STS case was executed. Test names in the source are the authoritative executed scenario boundaries. One combined scenario can contain many assertions but is counted once by its runner.

| Feature / selected AC | Actual source | Selected observations |
| --- | --- | --- |
| F-01 AC-01-14/17-19 (partial STS coverage) | `apps/api/tests/unit/auth-rules.test.ts`; `apps/api/tests/features/workflows.test.ts` | Absolute boundary/future timestamps; CSRF format/equality; real bootstrap/login/trusted identity/role refresh; generic credential errors; strict schema/transport; regeneration; expiry/logout/replay; already-authenticated conflict; old token; 10th/11th attempt; store failure; exact persisted deadline; overlapping read/logout; independent session; forged cookie/foreign origin/method checks. |
| F-01 AC-15/16, F-02 selection, F-03 editing, F-04 confirmation, F-05 display (selected journeys) | `tests/browser/feedback.spec.ts` | Actual browser-to-PostgreSQL normal workflow, keyboard login, required rejection retaining feedback, immutable own readback after browser reload, Closed mean/comments, script-looking text not executed, no page overflow at 360px/1280px. |
| F-02 ownership/discovery/pagination AC | `apps/api/tests/features/workflows.test.ts` | Same-Course foreign Section rejection; respondent role rejection; hidden Drafts; strict duplicate/leading-zero query rejection; real authorized selectors. |
| F-03 lifecycle/revision/freeze/concurrency AC | `apps/api/tests/unit/feedback-rules.test.ts`; feature suite | Draft blanks versus publication validation; scalar bounds; unique survey; stale/no-op revisions; stable IDs; foreign-owner rejection; eligibility snapshot; published edit refusal; actual edit/publish race. |
| F-04 validation/atomicity/readback/concurrency AC | unit/feature suites | 2,000/2,001 non-BMP code-point boundary; malformed Unicode/NUL/required/duplicate/wrong-survey/type/range/empty rejection; no partial writes; actual SQL fault rollback; concurrent duplicate; both actual API submit/close lock orders; own-only readback. |
| F-05 statistics/state/privacy/integrity AC | unit/feature/browser suites | Exact half-up/null means; Published count-only; Closed distribution/comment projection; respondent/foreign-owner rejection; invalid persisted type causes RESULTS_INCONSISTENT; escaped UI text. |
| Cross-feature persistence | `scripts/verify-restart.ts` | Starts/stops/restarts the built API process with the same database and secret, then compares identity/deadline, survey, own answers and results. No migration/reseed between starts. Run after the feature suite with its private RESTART_PASSWORD. |
| Inherited foundation/tooling | existing unit/API/foundation/DB/ORM suites and `tests/e2e/workspace.spec.ts` | Retain prior migration/seed/constraint checks and configuration/driver/liveness checks, distinctly from product scenarios. |

## Genuine RED/GREEN history

| Real RED version | Observed failure and correction boundary |
| --- | --- |
| `b63e613` | Three intended-rule tests failed for stubbed absolute expiry/future timestamp/CSRF predicates. `fa944d9` implements the predicates; later full unit runs pass them. This is genuine new history, not a reconstruction of earlier #15 work. |
| `fa944d9` | Feature suite had 4 failed / 5 passed before feedback routes existed. The context/create assertions received 404; dependent response/result scenarios also failed. Treat dependent scenario failures as missing-route observations, not independent proof of every business-rule RED. |
| `4f9e593` | Exact persisted deadline regression failed: upstream connect-pg-simple rounded expiry up to a second. Targeted run: 1 failed / 13 not selected. The correction updates expire to the exact absolute millisecond deadline before save acknowledgment; the final full suite checks it. The test later selects its exact SID so earlier sessions in a full run cannot contaminate the fixture. |
| `f0ccc3c` | Deterministic browser bootstrap regression expected one request and observed two, failing in both viewport projects. The correction coalesces in-flight session bootstrap requests; selected and full final browser runs record the actual result. |

Initial browser runs also failed on exact text-label matching for select/textarea labels; accessible combobox/textbox role locators corrected those test targeting problems without weakening the behavior assertions. One subsequent browser login exposed the real bootstrap race above. These failures remain disclosed; no retry or automatic POST replay is used to mask them.

## Completion boundaries and remaining verification

Actual final commands/counts/tested commit are recorded in the PR and generated review report snapshot after execution. Working-tree observations must not be relabelled as release SHA evidence. No coverage percentage is claimed.

- Human teammate review/integration is pending for this increment. #35 must integrate first; review the feature-only range against its source. No merge is performed by this work.
- Selected automated checks do not certify all 47 F-01, F-02/F-03/F-04/F-05 STS cases, every AC subcondition, accessibility compliance, deployment/proxy behavior, network-loss/failure UI permutations or P15 human usability sessions. Keep non-executed planned cases Not run and close remaining gaps under #22/#23 before declaring full Product DoD.
- #24 setup commands and private synthetic handoff are supplied; actual teammate clean-checkout reproduction remains unobserved. Record their real outcome rather than AI impersonation.
- #25 requires reviewed/integrated staging and a separately reviewed staging-to-main release. No immutable assessed release exists for this candidate; no tag/merge is created here.
- #26 may assemble a clearly marked review draft with full source Parts A-E and selected observed evidence. Final release-linked output, contributions and review/integration evidence remain incomplete until they occur. Do not submit the draft as an accepted final report.
