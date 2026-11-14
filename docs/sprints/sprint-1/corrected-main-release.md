# Corrected Sprint 1 main release

**Assessed application: `sprint-1.1` -> `b458cb65736029f5c7de55e49c9afd6bc8de702a`.** Release PR #48 received R1NNE0's substantive approval of staging `4070a872e4ee925bf777b607c2787cfdb6af6f97` and merged into main. The actual main commit then passed the checks below before the distinct annotated correction tag was published. The original `sprint-1` tag still points to `af2e103`; it was not moved.

## Current result and reproducibility

A new GitHub clone checked out the exact merged main SHA and ran `npm ci` from its lockfile. Seven separate new empty, explicitly allowlisted PostgreSQL databases were created for feature, release, foundation, tooling, browser, logout and post-release suites. Node 24.22.1, npm 10.9.2 and PostgreSQL 17.11 were observed. Chromium executable cache reuse is explicit; no private configuration, populated demo database or previous test database was reused.

**219 selected automated executions passed; 0 failed; 0 skipped.** Typecheck, build, generated ORM query and actual built-process restart passed. The restart compared the same persisted session/deadline, survey, own answers and results without migration or reseed between starts. The command/output table that follows identifies this exact main commit, not a candidate.

| Suite | Actual passes | Execution boundary |
| --- | --- | --- |
| Unit | 41 | Pure rules, runtime/configuration and database safeguards |
| API liveness | 2 | Actual HTTP liveness boundary |
| Feature API/PostgreSQL | 41 | Real sessions, transactions, access, persistence and concurrency |
| Release/PostgreSQL | 7 | Real failure/acknowledgement/deadlock and logging checks |
| Database foundation | 9 | Migration, seed, real constraints, typed adapter and storage |
| Database tooling | 2 | Guarded PostgreSQL compatibility |
| Isolated HTTP/browser | 84 | Browser state and recovery with mocked HTTP; not real PostgreSQL evidence |
| Real browser/API/PostgreSQL | 22 | Normal/rejection/recovery and selected keyboard/layout journeys |
| Real logout/API/PostgreSQL | 2 | Native cookie/token rotation and deliberate retry |
| Browser smoke | 4 | Database-free inherited smoke boundary |
| Unsupported-mode API/PostgreSQL regression | 5 | Both lifecycle states, mode rejection and authorization precedence |
| Total | **219** | No historical run added to this total |

## Correction and meaningful RED/GREEN evidence

PR46-DEF-01 was one defensive Sprint 1 contract defect (AC-F04-22 / TEST-F04-I10), observed in two lifecycle states. The original identified-only release lacked a mode guard on own-submission GET. A test-only unsupported ANONYMOUS enum value produced 200 and own answer content instead of 409 MODE_NOT_SUPPORTED. This did not demonstrate anonymous product availability or another student's answers.

The genuine RED test version `eef5e75` reproduced **3 passes / 2 failures** against PostgreSQL. The production guard followed in `609bbcd`: authorize and scope first, then reject unsupported mode before participation/answer reads. Its selected candidate verification passed 53 tests. R1NNE0 independently verified the five focused cases and subsequently approved PR #47. R47-01 established the enhanced test as canonical; PR #46 synchronized it byte-for-byte and retained the original source as a non-executable historical archive.

PR #47 merged as `970872e3`; PR #46 merged as `4070a872`; reviewed release PR #48 merged as `b458cb65`. On the actual corrected main, all five focused cases now pass as part of the current 219 executions. Published and Closed readback reject with 409 for eligible submitted and unsubmitted respondents; ineligible callers retain 404 and owners 403; response snapshots remain unchanged. POST and owner results also reject unsupported mode without fallback.

The original historical 214-pass release record and original additional 3-pass/2-fail investigation are preserved unchanged. They are not current failures, current test counts, or a claim the historical release was already fixed. Current production schema still permits IDENTIFIED only; future Anonymous Mode remains a separate Sprint 2 feature.

## Current assessed-version demonstrations

All application figures in this revision were captured on the actual corrected main. Domain figures come from its real browser/API/PostgreSQL run. The four supplementary authentication figures use its built API, real Vite frontend source and the isolated seeded PostgreSQL target. They are automated demonstrations, not four extra runner tests. The first authentication capture attempt could not locate the browser executable before any browser assertion; it was rerun successfully using the same explicit Chromium cache as the test matrix.

| Scenario / IDs | Role, starting condition and brief steps | Expected and actual result |
| --- | --- | --- |
| Normal journey / F-03–F-05 / AC-F03-22, AC-F04-09/15/17, AC-F05-03/08/17 | Owner creates/saves/publishes; eligible student submits; reload/relogin retrieves persisted answers; owner closes and reads results. Real B23-01. | Missing required rating rejects 422 with no response rows; valid 201; exact saved own answers after reload/relogin; Published count only; Closed means/bins/comments match real rows. |
| Lifecycle rejection / F-04 / AC-F04-08/18 | Eligible unsubmitted student retains a Published form while owner closes; student submits and reconciles current state. Real B23-03. | Closed request rejected; no extra response rows; Closed state recovered without automatic POST replay. |
| Authorization / F-02–F-05 / AC-F03-02, AC-F04-06/16, AC-F05-04 | Different owner in the same Course attempts the survey/results; respondent attempts owner operations and spoofed actor fields. INT22-06 and B23-04. | Actual protected 404/403 and schema rejections; scoped list contains no other owner's survey; no private answers or writes. |
| F-AUTH-01 / Guest / AC-F01-03/15 | Fresh browser opens application with no session. | Enabled Login, empty password and no private workspace. |
| F-AUTH-02 / Owner / AC-F01-03/06 | Submit locally generated synthetic credentials, then GET `/api/auth/me`. | Login 200; trusted current identity 200/OWNER; no password input remains in owner workspace. |
| F-AUTH-03 / Guest after logout / AC-F01-09/16 | Owner clicks Log out and waits for real server acknowledgement. | Logout 204; enabled Login; empty password; private workspace absent. |
| F-AUTH-04 / Guest after logout / AC-F01-09/16 | Direct protected `/api/auth/me` after confirmed logout. | 401 AUTH_REQUIRED, safe error-only JSON and no identity. |

## Accepted limitations and completion meaning

The actual PR #46 and release PR #48 approvals accept the Minor AC-F05-08 evidence gap: tests assert the five distribution counts but do not explicitly assert score labels and ordering `[1,2,3,4,5]`. This is an accepted evidence limitation, not a confirmed implementation defect. Current AC status is Partial / Accepted Minor for that complete criterion; no missing assertion is invented.

Other Partial entries retain exact unproved timing/failure/manual subconditions from the larger STS. The approved release is a bounded working increment, not a claim that every expanded permutation or human accessibility check was executed. Actual R1NNE0 release review found no further actionable Blocker, Major or Minor issue. Historical G04 checks retain their original source and are not silently relabelled as current executions. Full assistive-technology/WCAG certification, deployment profiles, later features and later labs remain separately allocated.

## Current process, board and submission boundary

The report includes complete Parts A–E, current Part F, all 113 AC and 183 planned STS cases, real tests/RED/GREEN/reviews, confirmed students/account mapping and observed contributions with AI assistance disclosed. No unreported hours, pairing, human test execution or personal comprehension is invented.

The authenticated post-release Kanban read on 13 November shows Backlog 1 (#26), Started 1 (#8), Done 23, and the other columns 0. #26's Backlog placement is stale relative to active report assembly; it is reported as observed rather than silently claimed Done. These two items track final corrected-report publication/review and umbrella closure. Final repository issue updates are separate from the photographed state. No course submission or compliance with the original 8 November deadline is claimed.

Source-bound commands, all 84 source/config/test hashes, safe raw logs, capture hashes and actual approval are retained in `corrected-main-verification.json`. The assessed app/tag remains separate from the document source and later PDF publication commit.
