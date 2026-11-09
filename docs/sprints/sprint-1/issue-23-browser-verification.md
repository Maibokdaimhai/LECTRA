# Issue #23 - Critical Sprint 1 browser verification

Recorded 2026-11-10 (Asia/Bangkok). Branch: `test/23-sprint1-browser-journeys`; baseline `d096a17c57b9ad0f49ec539a96905f729697100b`. These are **uncommitted working-tree observations**, not tests of a new commit, an accepted release, or completion of all Sprint 1 STS. No Git commands or GitHub mutations were performed.

**Final post-fix result: 14/14 real-browser executions passed, 38/38 isolated mocked-browser checks passed, and 4/4 smoke checks passed.** Typecheck and build passed after the narrowly authorized DEF-B23-01 fix. All final suites have zero failures, skips and flaky results. The original pre-fix 12-pass/2-failure result is preserved in [pre-fix-coverage.json](issue-23-evidence/pre-fix-coverage.json), the failure history below and unchanged pre-fix screenshots. No assertion was weakened, skipped or marked expected-failure. Ready for teammate review; human acceptance and release remain separate gates.

Machine-readable mappings, actual names, viewport results, commands, source hashes and screenshot provenance are in [issue-23-browser-coverage.json](issue-23-browser-coverage.json). The hash map identifies the working-tree source used; do not label the baseline SHA as the SHA of these newly written tests. After the user's commit workflow, rerun against the actual recorded commit before claiming immutable-commit evidence.

## Scope and implementation

Issue #23 owns selected real browser journeys and their UI evidence. The user explicitly expanded this PR to include one production fix: DEF-B23-01 in `apps/web/src/main.tsx`. Issue #22 retains API matrices, PostgreSQL constraints/rollback/concurrency and process-restart verification. No other production file, Prisma schema/migration, feature contract, Issue #22 test/evidence or historical PDF was changed.

The existing normal workflow and keyboard case were extended, preserving identified disclosure, frozen-questionnaire, text escaping, reload and responsive assertions. Both viewports now create their own Draft through the UI rather than using the narrow project's seeded Draft. Five additional cases cover actual rejection/recovery/session/state behavior. All original 18 HTTP-fixture recovery scenarios are retained, with one additional DEF-B23-01 failure-recovery scenario. Workspace smoke files/configuration are unchanged.

| Scenario | File | Selected AC | Planned STS references / coverage boundary | Final 1280px / 360px |
| --- | --- | --- | --- | --- |
| B23-01: Owner creates/saves/publishes; Respondent validates/submits/reloads/relogs in; Owner count-only then Closed summary | `tests/browser/feedback.spec.ts` | AC-F03-22/24; AC-F04-01/02/15/17/23/25; AC-F05-02/03/09/13/18/20 | TEST-F03-E01/E04, TEST-F04-E01/E02/H02/H03, TEST-F05-E01/E03: selected subconditions only | Pass / Pass |
| B23-02: invalid credentials, cleared password/retained email, focused error and Enter login; one initial bootstrap | `tests/browser/feedback.spec.ts` | AC-F01-03/04/15 | TEST-F01-E01: selected local-browser conditions | Pass / Pass |
| B23-03: duplicate rejection; stale Published form loses to Close; authoritative Survey GET, Closed UI without reload, one rejected POST and unchanged rows | `tests/browser/sprint1-rejections.spec.ts` | AC-F03-04; AC-F04-08/10/15/17/19 | TEST-F03-E04 and TEST-F04-E01; I10/I11 are shared-rule references, not complete API-case execution | **Pass / Pass: DEF-B23-01 resolved** |
| B23-04: real Respondent management 403, other-Course Owner 404, guest 401; safe errors and unchanged definition | `tests/browser/sprint1-rejections.spec.ts` | AC-F01-12; AC-F02-02/07; AC-F03-02; AC-F04-06/16 | Selected TEST-F03-E04/TEST-F01-H02; TEST-F04-I08/I17 remain primarily #22's matrix | Pass / Pass |
| B23-05: entered private answers; real expiry 401; visibility revalidation removes private content; delayed earlier read cannot restore it; reauthentication/logout/reload | `tests/browser/sprint1-recovery-states.spec.ts` | AC-F01-07/09/14/16; AC-F04-20 | TEST-F01-E02/E03, TEST-F02-E03, TEST-F04-E04: selected conditions | Pass / Pass |
| B23-06: actual POST commits 201, delivery is aborted, failed status delivery keeps Submit blocked, real GET recovers saved answer and one response | `tests/browser/sprint1-recovery-states.spec.ts` | AC-F04-17/18 | TEST-F04-E03: real committed branch; existing mocks retain the uncommitted permutations | Pass / Pass |
| B23-07: real empty contexts/eligibility, zero-response Closed results, held actual read, aborted delivery, explicit successful retry and zero rows | `tests/browser/sprint1-recovery-states.spec.ts` | AC-F02-14/15/18; AC-F05-10/19/20 | TEST-F02-E01/E02/E04, TEST-F05-E02/E04: selected conditions, not all pagination/denial/no-data variants | Pass / Pass |

All broad STS mappings remain **Partial**. An individual passing runner scenario is not proof that every input, fault or manual condition in the corresponding planned row ran. Do not edit the accepted Planned STS documents to turn these selected outcomes into blanket Passed records.

## Real versus simulated boundaries

- All seven feature scenarios run the real React application, real `createApp` Express stack and PostgreSQL 17 schema. Browser-session forbidden-access probes are supplemental; they do not replace #22's complete authorization tests.
- B23-05 forwards a real pre-expiry read and holds its delivery. A real browser fetch to `/api/auth/me` gets 401 SESSION_EXPIRED; visibility bootstrap then removes the private workspace before the earlier read is released. This is not certification of every protected UI action's expiry path.
- B23-06 forwards the actual POST with `route.fetch()`, verifies the actual server's 201, then aborts browser delivery. It never supplies a mocked success. Status-delivery failure is an intentional network interruption, not a PostgreSQL outage. The persisted readback and read-only row counts confirm one committed response.
- B23-07 holds an actual GET response and aborts one delivery, then retries the actual API. It does not certify database-outage error mapping.
- `review-recovery.spec.ts` remains explicitly mocked HTTP: the original 18 cases plus one new lifecycle/status-read failure case at two viewports, 38 executions. The new case proves a failed lifecycle GET cannot be bypassed by a successful own-status read, and that a subsequent status-read failure cannot falsely claim no submission. The two workspace cases at two viewports give two browser liveness and two API-request executions, without a working database.

## Environment, isolation and cleanup

Observed runtime: Windows, Node 24.22.1, npm 10.9.2, Prisma 7.10.1, PostgreSQL 17.11, Playwright 1.65.0 and its downloaded Chromium 158.0.8127.18 (revision 1254). Exact lockfile installation succeeded (`npm ci --no-audit --no-fund`, 324 packages); no audit result is claimed. Package manifests and lockfile were not changed. The originally selected system runtime was different; every reported run selected the pinned private runtime first.

A new task-owned PostgreSQL cluster was created under ignored `.local/issue23-14db9b34509d/data`, on loopback 55423. Its actual `data_directory` and PostgreSQL version were verified. Fresh databases `lectra_test_issue23_a`, `_b` and `_c` hold the earlier runs. The post-fix run used another newly created database, `_d`. No existing service, development/shared database, Issue #22 database or container was modified. Private random test credentials stayed in ignored task configuration; no existing user environment file was overwritten.

The final post-fix run used **lectra_test_issue23_d**, verified empty before preparation. Existing `prepare-browser.ts` verifies `assertTestDatabase`, distinct development reference, matching `ALLOW_BROWSER_TESTS`, aligned runtime/test URLs and empty public tables before migrating/seeding. Test-side fixture connections repeat the guard before pool creation and verify `current_database()`. The development reference is a separate unavailable loopback port, never a migration/seed target.

`support/real-app.ts` starts a fresh real application on loopback 3102 per scenario, with a private injected clock. Thus each scenario has a fresh process-local limiter instance; no throttle is disabled and no public clock endpoint/header is added. Vite remains on 4174. Ports cannot be reused; teardown closes the exact test server and pool. Both viewport projects run with one worker and zero retries.

Scenario-specific deterministic Lecture IDs/sequence values prevent order dependence. The fixture cleanup removes only rows reachable from its exact owned Lecture IDs, in FK-safe transactional order; it does not reset/truncate the seed. Final read-only audit found the original 7 Users, 3 Lectures, 1 Draft, 2 Questions, and **zero Participation/ResponseBundle/Answer rows**. Session/migration rows remain only in the disposable cluster for diagnosis. The task-created PostgreSQL server was cleanly stopped after verification; ignored data/tools are retained, not running.

Future full runs require another new empty allowlisted database and private configuration. Do not rerun preparation against these populated schemas or add a reset to bypass the guard. Use a new opted-in target, the pinned runtime and `npm run browsers:install` when binaries are absent.

## Commands and actual results

All results below were executed in this task, not copied from the earlier author-reported 115-test result. `PLAYWRIGHT_JSON_OUTPUT_FILE` selected a different ignored JSON report for each browser run. PATH selected Node 24.22.1/npm 10.9.2. Traces remained off for credential-bearing feature/recovery tests.

| Actual command | Result |
| --- | --- |
| `npm run typecheck` | Exit 0; API, web and tooling checks, with Prisma generation |
| `npm run build` | Exit 0 with permitted subprocess execution; API and Vite production build |
| `npm run test:e2e:features -- --output .local/evidence/issue23-def-fix-feature --reporter=list,json` | Exit 0: **14 passed, 0 failed/skipped/flaky**; real PostgreSQL |
| `npm run test:e2e:recovery -- --output .local/evidence/issue23-def-fix-recovery --reporter=list,json` | Exit 0: **38 passed, 0 failed/skipped/flaky**; mocked HTTP |
| `npm run test:e2e -- --output .local/evidence/issue23-def-fix-smoke --reporter=list,json` | Exit 0: **4 passed, 0 failed/skipped/flaky**; inherited smoke |

For the final feature command, `.local/issue23-14db9b34509d/browser-d.env` was imported into that command's process environment before invoking npm. Node's existing-environment precedence preserves these new test targets when the unchanged script reads `.local/browser.env`; no private file was overwritten. The final feature runner timestamp is `2026-11-09T19:44:23.835Z` (2026-11-10 02:44:23.835 Asia/Bangkok). Typecheck and build were both executed after the production fix.

Raw report JSON, console output, error-context snapshots and all original screenshots remain local/ignored under `.local/evidence/issue23-*` and the task directory. Old run C and new `issue23-def-fix-*` reports are retained separately. Those paths are not published attachments. Selected safe screenshots are copied below; their exact source paths and SHA256 values are in the coverage JSON.

## Preserved failure history

- Initial Windows setup attempts encountered a framework RNG/native argument-binding problem and restricted-token diagnostics. They were corrected before usable task database preparation; no production safety guard was bypassed.
- A sandbox build failed at Vite subprocess startup with EPERM. The same build passed with permitted subprocess execution; this is not a product-rule RED/GREEN claim.
- Initial real run A: 14 passed before adding the explicit Closed-form UI assertion. This was incomplete coverage, not proof that the Closed recovery was correct.
- Run B: 11 passed / 3 failed. Two failures reproduced DEF-B23-01; one test-side race read Published count-only data before Close completed. Awaiting the visible CLOSED state fixed that synchronization error without changing production or relaxing expectations.
- Pre-fix run C: 12 passed / 2 failed, both DEF-B23-01. Automatic retries were zero. A soft assertion permitted the same failing case to also verify correct database rejection and successful reload; it did not make that scenario pass.
- Post-fix run D: **14 passed / 0 failed / 0 skipped**. The original soft defect assertion is retained, with stronger Published-before-Close, actual lifecycle-GET, Closed-before-reload, no-Submit and exactly-one-POST assertions. All passed. Supplemental mocked coverage is now 38/38; the original 36 remain passing. This is an observed failing-before/passing-after correction in the working tree, not a fabricated RED/GREEN commit history.

## DEF-B23-01 - resolved narrow frontend production fix

Status: **Resolved and verified at both widths**, pending teammate review. Original severity: Minor. The backend correctly protected data throughout; the defect was stale frontend lifecycle state.

Pre-fix source: `apps/web/src/main.tsx`, original ResponseForm lines 499-505 and 518-520, preserved by the historical source hashes. Recovery loaded only `my-submission`; false status cleared uncertainty without refreshing the PUBLISHED parent Survey. Current fix: parent refresh callback near line 398, `recoverSubmission` near line 481, exact status/code check near line 513 and Closed rendering near line 531.

Only `409 INVALID_STATE` marks lifecycle refresh required. Recovery awaits an authorized Survey GET, updates the parent-owned Survey, then reads own submission status. Other 409 codes, including duplicate submission, retain their existing own-status recovery and are not interpreted as Closed. The response component stays mounted through the lifecycle update, preserving rejection feedback rather than losing it through a status-key remount. Closed removes answer/Submit controls; unresolved status gives an explicit status-check action instead of a false not-submitted claim. A failed lifecycle read keeps submission blocked until a deliberate retry completes that read. No POST is automatically replayed and existing auth/request-generation guards are retained.

Original reproduction (B23-03), retained as failure history:

1. Owner publishes an identified survey; Respondent 12 opens its form and selects 4.
2. A separate Owner session closes that survey.
3. Respondent submits the stale form: actual API returns 409 INVALID_STATE.
4. Actual own-submission read is false; owner count stays one (the earlier different respondent), and stored rows stay one Participation/bundle/answer.
5. UI still displays PUBLISHED and enabled Submit. The regression expects no enabled Submit and fails with expected count 0 / actual 1.
6. Reload/reopen correctly displays Closed with no submission action. This recovery was also asserted after the soft failure.

Contract basis: F-03 section 8 requires that Closed cannot enable Submit; F-04 section 6 requires distinct Closed/error states. Related AC-F04-08/17/19. The user subsequently authorized this one F-04 frontend correction in the Issue #23 PR; no other production feature was changed. The real regression now proves step 5 is corrected without requiring step 6: current CLOSED is visible, original INVALID_STATE feedback is retained, no Submit exists and one rejected POST leaves stored rows unchanged. Reload readback still passes. No GitHub defect/review action was performed.

## Selected actual screenshots

| Capture | Context / expected and actual observation |
| --- | --- |
| [Current recovery, wide](issue-23-evidence/closed-recovered-chromium-wide.png) | Post-fix run D, B23-03: actual Closed badge/message, retained rejection feedback and no Submit before any reload. |
| [Current recovery, narrow](issue-23-evidence/closed-recovered-chromium-narrow.png) | Same post-fix observation at 360px; actual one rejected POST and unchanged response rows are asserted by the test. |
| [Closed results, wide](issue-23-evidence/closed-results-wide.png) | B23-01 Owner; one persisted score 5; actual count 1, mean 5.00, five bins and literal unlabelled feedback. Selected AC-F05-03/18. |
| [Closed rejection defect, narrow](issue-23-evidence/closed-stale-rejection-narrow.png) | B23-03 Respondent 12; after real rejection, expected no enabled Submit; actual stale PUBLISHED badge and active button. DEF-B23-01. |
| [Uncertain outcome recovered, narrow](issue-23-evidence/uncertain-recovered-narrow.png) | B23-06 Respondent; real commit followed by interrupted delivery; actual persisted immutable readback, one POST. AC-F04-18. |
| [Zero results after retry, narrow](issue-23-evidence/zero-results-narrow.png) | B23-07 Owner; actual zero count, null mean represented as no answers, zero bins and no response rows. Selected AC-F05-10/19. |

The original four captures are preserved historical run-C evidence, including the old defect screenshot. The two new recovery captures come from run D. The narrow post-fix capture was visually inspected and shows Closed/no Submit with INVALID_STATE feedback. None is release evidence or broad visual/accessibility certification.

## Remaining gates

All seven real scenarios are implemented and passing at both widths. DEF-B23-01 is fixed, with its original failure evidence and strengthened passing regression preserved. This combined test/evidence plus narrow production fix is ready for teammate review; acceptance/merge is the human team's decision. After the user's Git workflow, retain the actual tested commit and appropriate integration checks. No complete API/concurrency, assistive-technology, HTTPS/proxy, P15 human-usability, application-restart, release or final PDF claim is made. Preserve #22's separate source/version/results instead of combining its counts with these browser runs.
