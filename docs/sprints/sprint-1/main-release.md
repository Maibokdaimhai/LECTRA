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

All figures below are actual synthetic captures from the real browser/API/database run at the assessed main SHA. They are not old candidate pictures. The UI test assertions and real API/database checks establish persistence, rejection and authority; pictures alone do not prove backend security.

| Demonstration | Feature/AC, role, precondition and steps | Expected and actual |
| --- | --- | --- |
| Normal journey and persisted readback | F-03/F-04/F-05; AC-F03-22, AC-F04-09/15/17, AC-F05-03/08/17. Owner creates/saves/publishes; eligible student submits rating/text; reload/relogin retrieves; Owner closes and reads summary. Real B23-01 at 1280/360. | Actual 422 for missing required rating with zero response rows; deliberate valid 201; exact own saved answer readback; Published count-only; Closed mean/bin/comment assertions. [Submission](main-release-evidence/persisted-submission-narrow.png), [Closed summary](main-release-evidence/closed-results-narrow.png). |
| Meaningful lifecycle rejection/reconciliation | F-04; AC-F04-14/18; eligible unsubmitted student has stale Published form while Owner closes; submit rejected, authorized GET reconciles without automatic POST replay. | Actual rejection, Closed UI, no further Submit, retained uncertainty rules. [Recovered Closed rejection](main-release-evidence/closed-rejection-recovered-narrow.png). |
| Backend ownership/access denial | F-02/F-03/F-04/F-05; AC-F03-03, AC-F04-01, AC-F05-01. Owner B in same Course attempts A's resource/results, plus Respondent management/spoofed actor requests. Actual API feature cases and B23-07. | Real 404/403 assertions, no other-owner survey in list, no mutation/answer disclosure. [Foreign owner safe list](main-release-evidence/foreign-owner-safe-list-narrow.png). |
| Login/logout and failure recovery | F-01; AC-F01-06/07/09/13/16/19. Native browser cookie changes before held bootstrap body; session-store outage; explicit current-token retry. | Actual first 503, private workspace absent, retry uses fresh cookie-bound token, 204 revokes, no automatic replay/reload, subsequent /me 401. `playwright.logout.config.ts`: 2 passes. |

## Current completion boundary

#24 reproducible setup is supported by actual #39 review/integration and the accepted release. #25 application/review/main verification/tag evidence is complete. #26 owns the self-contained final PDF, current AC-to-test/results table, board/history/contribution evidence and final visual QA. Neither release tagging nor this evidence claims LEB2 submission or compliance with the original 8 November deadline.

Remaining accepted limitations include broader STS permutations, full human assistive-technology/WCAG certification and later deployment/P15 work; anonymous/export/history/notes remain later sprints. Both students' actual artifact contributions are recorded separately from AI assistance, personal comprehension and unreported pair work. No hours or pair sessions are invented.
