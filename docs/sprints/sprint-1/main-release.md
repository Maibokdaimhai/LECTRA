# Accepted Sprint 1 main release and post-main verification

Recorded 2026-11-12 (Asia/Bangkok). Assessed application: **`sprint-1` → `af2e1030984bcc816081b25b29c9de52a80efe30`**. The annotated tag was created and pushed only after the required post-main checks passed; it must not be moved. Later report/evidence commits are separate from the assessed application.

## Actual acceptance and integration

PR #40 merged on 2026-11-12 at 14:38:45 UTC. R1NNE0's substantive [release approval](https://github.com/Maibokdaimhai/LECTRA/pull/40#pullrequestreview-5876302498) at 14:38:33 UTC reviews staging `5848d958885603143b000bea81950d8c9737716d`, explicitly accepts documented G-04 dispositions/remaining limitations for the bounded MVP, and requires post-main verification/tagging. Main merge/checkout SHA is `af2e1030984bcc816081b25b29c9de52a80efe30`.

The accepted source contains #42 atomic auth persistence, #43 UI accessibility, #44 checked-out PostgreSQL client error handling and #45 final session/clock/logout-CSRF corrections. Actual source/review bodies are retained in [selected history](main-release-review-history.json); earlier feature approvals are not substituted for the release approval.

## Actual post-main results

A new GitHub clone checked out the exact main merge commit, installed from its lockfile with `npm ci`, and generated private isolated configuration. Browser executable cache was reused; no existing environment file, session, demo database or populated verification target was reused. Six separate new empty PostgreSQL databases served feature/release/foundation/tooling/browser/logout preparation. Node 24.22.1, npm 10.9.2 and PostgreSQL 17.11.

| Check | Passing executions | Final failures / skips |
| --- | --- | --- |
| Unit | 41 | 0 / 0 |
| API liveness | 2 | 0 / 0 |
| API + PostgreSQL | 41 | 0 / 0 |
| Release SQL/connection-loss/deadlock | 7 | 0 / 0 |
| Foundation | 9 | 0 / 0 |
| Database tooling | 2 | 0 / 0 |
| Isolated HTTP/browser | 84 | 0 / 0 |
| Real browser/API/PostgreSQL | 22 | 0 / 0 |
| Real native-cookie logout/API/PostgreSQL | 2 | 0 / 0 |
| Smoke | 4 | 0 / 0 |
| Total selected executions | **214** | **0 / 0** |

Typecheck, production build, real Prisma/PostgreSQL adapter query and actual built-process stop/start also passed; these are checks, not additional test counts. Restart compared trusted identity, exact session deadline, saved survey, own answers and owner results against the same database without migration/reseed between starts.

[Machine-readable commands, exit codes, safe runner summaries, 82 source hashes and figure provenance](main-release-verification.json) identify the actual main SHA. Historical 138/144/208/49/36 matrices are not added to this total. Passing selected runner scenarios do not convert all larger STS rows into exhaustive Pass; actual G-04 scope acceptance and remaining Partial/Not run boundaries are retained.

## Selected assessed-version demonstrations

The original normal/rejection/access figures below are actual synthetic captures from the real browser/API/database run at the assessed main SHA. They are not old candidate pictures. The UI test assertions and real API/database checks establish persistence, rejection and authority; pictures alone do not prove backend security. The separately dated supplementary authentication captures below are not relabelled as part of that historical test run.

| Demonstration | Feature/AC, role, precondition and steps | Expected and actual |
| --- | --- | --- |
| Normal journey and persisted readback | F-03/F-04/F-05; AC-F03-22, AC-F04-09/15/17, AC-F05-03/08/17. Owner creates/saves/publishes; eligible student submits rating/text; reload/relogin retrieves; Owner closes and reads summary. Real B23-01 at 1280/360. | Actual 422 for missing required rating with zero response rows; deliberate valid 201; exact own saved answer readback; Published count-only; Closed mean/bin/comment assertions. [Submission](main-release-evidence/persisted-submission-narrow.png), [Closed summary](main-release-evidence/closed-results-narrow.png). |
| Meaningful lifecycle rejection/reconciliation | F-04; AC-F04-08/18; eligible unsubmitted student has stale Published form while Owner closes; submit rejected, authorized GET reconciles without automatic POST replay. | Actual rejection, Closed UI, no further Submit, retained uncertainty rules. [Recovered Closed rejection](main-release-evidence/closed-rejection-recovered-narrow.png). |
| Backend ownership/access denial | F-02/F-03/F-04/F-05; AC-F03-02, AC-F04-06, AC-F05-04. Owner B in same Course attempts A's resource/results, plus Respondent management/spoofed actor requests. Actual API feature cases and B23-04. | Real 404/403 assertions, no other-owner survey in list, no mutation/answer disclosure. [Foreign owner safe list](main-release-evidence/foreign-owner-safe-list-narrow.png). |
| Login/logout and failure recovery | F-01; AC-F01-06/07/09/13/16/19. Native browser cookie changes before held bootstrap body; session-store outage; explicit current-token retry. | Actual first 503, private workspace absent, retry uses fresh cookie-bound token, 204 revokes, no automatic replay/reload, subsequent /me 401. `playwright.logout.config.ts`: 2 passes. |

## Current completion boundary

#24 reproducible setup is supported by actual #39 review/integration and the accepted release. #25 application/review/main verification/tag evidence is complete. #26 owns the self-contained final PDF, current AC-to-test/results table, board/history/contribution evidence and final visual QA. Neither release tagging nor this evidence claims LEB2 submission or compliance with the original 8 November deadline.

Remaining accepted limitations include broader STS permutations, full human assistive-technology/WCAG certification and later deployment/P15 work; anonymous/export/history/notes remain later sprints. Both students' actual artifact contributions are recorded separately from AI assistance, personal comprehension and unreported pair work. No hours or pair sessions are invented.

## PR #46 additional post-release direct AC verification

The earlier report-only correction removed unsupported mappings without inventing results. The owner then requested actual direct tests. A separate real API/PostgreSQL run on unchanged assessed production sources now records **3 PASS / 2 FAIL / 0 skipped**, exit **1**; `npm run typecheck` passed. These are new post-release results, **not** part of the original **214 passed / 0 failed / 0 skipped** historical run. No production code, repository schema/migration, release tag or human approval was changed.

| AC / planned STS | Actual new execution ID | Direct result / remaining boundary |
| --- | --- | --- |
| AC-F04-22 / TEST-F04-I10 | PR46-I01; PR46-I04-PUBLISHED; PR46-I04-CLOSED | **POST PASS:** ANONYMOUS duplicate and first submission reject 409 MODE_NOT_SUPPORTED without writes. **Own GET FAIL in both states:** expected 409/error only, actual 200 with identified answers. This AC is not wholly satisfied; PR46-DEF-01 remains uncorrected. |
| AC-F05-01 / TEST-F05-I02; UI E02 remains separate | PR46-I02 | **API PASS:** own Draft results return exact 409 RESULTS_NOT_AVAILABLE with no statistics/mutation, including state-before-mode precedence. Foreign-owner and wrong-role controls reject 404/403. No new UI unavailable-state execution is claimed. |
| AC-F05-21 / TEST-F05-I02 | PR46-I03 | **API PASS:** own ANONYMOUS Published/Closed results reject exact 409 MODE_NOT_SUPPORTED without count/text fallback or response changes. Identified positive controls still work; this is selected evidence, not complete STS certification. |

Actual tests: `apps/api/tests/post-release/ac-gaps.test.ts`, isolated configuration `vitest.post-release.config.ts`. [Assertions, expected/actual results, fixture limits and failure output](../../deliverable-1/post-release-ac-verification.md), [machine-readable verification](../../deliverable-1/post-release-ac-verification.json), [unmodified runner JSON](../../deliverable-1/post-release-ac-test-results.json). The other 110 AC records and all accepted AC/STS identifiers and planned mappings are preserved.

**Conditional defect PR46-DEF-01:** `GET /api/surveys/:id/my-submission` at `apps/api/src/feedback.ts:252` scopes the actor/resource but lacks the mode guard before reading participation/bundles/answers. With the contract's unsupported ANONYMOUS fixture, an eligible respondent receives 200 and their existing identified answers instead of 409 MODE_NOT_SUPPORTED. Both failing regressions remain intact. No production fix or weakened expectation was introduced; the team records this as a Known Limitation, with correction and regression follow-up in Sprint 2 before enabling F-06 Anonymous Mode. AC-F04-22 remains Partial in Sprint 1.

The unchanged production enum accepts IDENTIFIED only. The suite first verified a new empty explicitly allowlisted database, migrated/seeded it, then added ANONYMOUS only to that disposable database to construct the contract fixture. No ordinary API path enabling anonymous collection or cross-user access was demonstrated. This tests a required defensive mode boundary, not implementation of future anonymous privacy. Fixtures were restored in finally, pools closed, zero other open transactions remained, and only the task-owned cluster was stopped. Historical release acceptance above remains a recorded past event, not acceptance of the newly observed failure.

## Supplementary assessed-release Login/Logout demonstration

Captured **13 November 2026 (Asia/Bangkok)** using actual Chromium, the built Express API, production web bundle and a newly initialized, explicitly allowlisted disposable PostgreSQL database. All 82 source/config/test hashes matched assessed **af2e1030984bcc816081b25b29c9de52a80efe30 / sprint-1** before and after capture. The unchanged application was launched from this documentation branch without a Git checkout. The documented local HTTP demo configuration was used with fresh generated environment values and dynamic loopback ports; existing private demo files and populated databases were not reused.

This is a supplementary browser demonstration automated with Playwright, not a rerun of the historical matrix or full execution of every E01/E02 subcondition. The initial guest has no private workspace; the synthetic owner uses locally generated credentials. Only the following selected observations are claimed. Captures contain no passwords, cookies, CSRF tokens or real feedback. [Source/hash, route, runtime, steps and observed-result record](../../deliverable-1/auth-demonstration.json).

| Figure / role / AC and planned STS | Starting condition and action | Expected and observed result |
| --- | --- | --- |
| F-AUTH-01; Guest; AC-F01-03/15; selected TEST-F01-E01 | Fresh browser and synthetic seed; open `/`. | Enabled Login form, empty password and no private workspace. [Login before authentication](main-release-evidence/auth-login-guest.png). |
| F-AUTH-02; Survey Owner; AC-F01-03; selected TEST-F01-E01 | Submit valid synthetic Owner credentials, then read `/api/auth/me`. | Actual POST login **200**, current identity **200 / OWNER**, trusted synthetic instructor identity and Owner workspace. No password field remains. [Authenticated Owner](main-release-evidence/auth-login-owner.png). |
| F-AUTH-03; Guest after Owner logout; AC-F01-09/16; selected TEST-F01-E02 | From the authenticated workspace, click Log out and wait for the real server response. | Actual POST logout **204**, enabled Login form, empty password, private workspace absent. The remembered synthetic email is not an authenticated identity. [Confirmed logout](main-release-evidence/auth-logout-guest.png). |
| F-AUTH-04; Guest after logout; AC-F01-09/16; selected TEST-F01-E02 | After the actual 204, directly navigate to protected `/api/auth/me`. | Actual **401 AUTH_REQUIRED** with safe error JSON and no private identity. [Protected request denied](main-release-evidence/auth-logout-denied.png). |

The browser, temporary API/preview processes and only the task-owned PostgreSQL cluster were stopped after capture. These observations are separate from the unchanged **214 passed / 0 failed / 0 skipped** historical release result. No new test total, teammate execution, approval or course submission is claimed.

## Final known-limitation disposition

Team decision: PR46-DEF-01 is a Known Limitation discovered during additional post-release verification. PR46-I04-PUBLISHED and PR46-I04-CLOSED are two observations of the same underlying unsupported-mode own-readback defect. AC-F04-22 remains a Sprint 1 AC with Partial disposition. Correction is deferred for team follow-up in Sprint 2 before enabling F-06 Anonymous Mode; regression tests must be rerun after correction. The defect is not fixed. The existing Sprint Plan and original assessed release are unchanged.

Historical release: 214 Passed / 0 Failed / 0 Skipped. Additional verification: PR46-I01, PR46-I02 and PR46-I03 PASS; PR46-I04-PUBLISHED and PR46-I04-CLOSED FAIL. These totals remain separate; neither the passing additions nor the known-limitation decision imply full AC completion.
