# PR #36 review corrections

**Historical first-pass record:** [second-pass corrections and current evidence](pr36-second-pass-fixes.md) cover the later N1–N5 findings. This record retains its actual first-pass source and results.

Recorded 2026-11-09. Source under test: `b094bf9ee3140b90c357f20a20e093020965c727` (also recorded in [verification JSON](pr36-review-verification.json)). This is a staging candidate, not a main release. No new human approval, merge, issue closure or final report submission is claimed.

Review source: [R1NNE0's actual CHANGES_REQUESTED review](https://github.com/Maibokdaimhai/LECTRA/pull/36#pullrequestreview-5826938918), submitted against `eb02e1c`. These are engineering corrections to the accepted LECTRA design; they do not create new instructor requirements.

## Disposition and behavior

| Finding | Correction | Regression evidence |
| --- | --- | --- |
| R1 — background checks discard unsaved inputs | Session checking leaves the workspace mounted and temporarily disables its form controls. A successful same-identity/role check refreshes session data without changing the request generation or component identity. A temporary service failure retains inputs behind the disabled workspace until reconnect succeeds. A confirmed guest or different identity/role unmounts the previous workspace. Logout and authenticated API 401 still clear private state. | Real React/browser tests retain owner title/prompt and a respondent rating after revalidation, discard the old owner's form on confirmed guest identity, and retain/gate/re-enable edits during a session-service outage. |
| R2 — revision conflict and uncertain mutations have no recovery | Draft save retains local title/questions and blocks save/publish after 409, server failure or unknown outcome. An explicit persisted GET displays the latest status, revision and questionnaire. The owner chooses either to use that copy or explicitly reapply retained edits to its revision; reapplying does not send a mutation. Questions removed on the server receive new identifiers only on a later explicit save. Failed reconciliation retains edits and can be retried. Pending saves disable definition controls, preventing late replies from replacing newly typed input. | HTTP fixtures check conflict, latest-revision comparison, removed-ID reconciliation, the revision on the subsequent PATCH, a committed save whose response is lost, a failed persisted read followed by successful retry, and mutation counts proving no automatic replay. |
| R2 — create/publish/close/delete outcome recovery | Create failures require checking the selected lecture's persisted survey before another create. Publish/close/delete failures block another transition until an explicit survey GET refreshes authoritative status/revision; a 404 returns to the scoped list rather than asserting that a stale draft still exists. A recovered Published/Closed state exposes the frozen questionnaire. Dirty, saving or unreconciled editor state blocks destructive/lifecycle actions. | Isolated HTTP/browser cases cover lost create, publish, close and delete responses, publication revision conflict and resulting fresh Draft revision, persisted Closed state and persisted 404. Each case asserts mutation counts; these cases are not real network-fault/API/database acceptance evidence. |
| R3 — validation and insertion observe different membership sets | One SQL statement materializes Section members and their roles once. Both invalid-role checking and eligibility insertion consume that same set. Any invalid member suppresses insertion and returns ELIGIBILITY_INVALID; an empty set returns ELIGIBILITY_EMPTY. The enclosing Survey-lock transaction still makes status and eligibility atomic. Snapshot membership semantics apply at that statement's snapshot; later membership edits cannot change the frozen set. | A real PostgreSQL concurrency case gates the initial read with a disposable test-only view/advisory lock. While it is waiting, another connection replaces member 12 with member 13. Publication must freeze the original validated 11/12 set, not a second-read 11/13 set. Additional real-route checks verify invalid/empty membership leaves Draft, publishedAt and eligibility unchanged. |
| R4 — owner cannot inspect Published questionnaire | Owner detail shows an ordered read-only questionnaire in both Published and Closed states: prompt, type, required/optional flag, rating limits, labels and interpretation. Published summary remains count-only; this view does not expose respondent answers or enable definition edits. | Isolated recovery browser cases inspect Published/Closed questionnaire metadata. The real web/API/PostgreSQL journey at both viewports also asserts both question prompts, rating interpretation, optional flag and absence of input/select/textarea controls inside the frozen questionnaire. |

Local edits live only in React memory. Explicit navigation away, page reload, confirmed account change or sign-out still ends that in-memory editing session; no browser persistent storage of private drafts/answers was introduced. There is no automatic mutation resend and no automatic merge of another tab's edits. Reapply is a whole-definition replacement reviewed by the owner; a further concurrent edit can still return a new revision conflict and requires reconciliation again.

## Actual verification

Runtime remains Node 24.22.1, npm 10.9.2 and disposable PostgreSQL 17.11. No new dependency or runtime service was added to the product. New command: `npm run test:e2e:recovery`; configuration: `playwright.recovery.config.ts`. The separate feature browser configuration selects only its real database-backed `feedback.spec.ts` journey to avoid mixing HTTP fixtures into the reported real-API count. Tooling typecheck now includes all Playwright configurations.

| Executed check | Result on the recorded source |
| --- | --- |
| Typecheck and production build | Both passed, including real generated Prisma client and API/web builds. |
| Unit tests | 37 passed. |
| API liveness | 2 passed. |
| Real API/PostgreSQL feature suite | 19 passed (includes the two new R3 cases). |
| Inherited foundation | 9 passed. |
| PostgreSQL tooling | 2 passed. |
| Real product browser journey/keyboard bootstrap | 4 passed, 360px and 1280px. |
| Isolated HTTP/browser review regressions | 20 passed: ten scenarios at each viewport. |
| Inherited browser smoke | 4 passed. |
| Actual ORM adapter compatibility | Passed. |
| Built API process stop/start | Persisted identity/session deadline, survey, own answers and results unchanged; no migration/reseed between starts. |

Total: **97 selected automated tests passed**. The final listed test suites had no failures or skips. This does not certify every planned STS/AC or replace renewed teammate review. Runtime/build/restart outcomes are separate checks, not additional counted tests. The actual Closed-questionnaire screenshots from both viewport journeys were inspected for readability; no comprehensive visual/accessibility certification is implied.

The [safe command-result snapshot](pr36-review-verification.json) contains exact commands and full tested commit. Raw outputs stay in ignored `.local/evidence/pr36-review-final-*.txt` and `.local/evidence/pr36-review-final-results.json`; these are local files, not published attachments. Test environment files are private, ignored and mode 0600. Only new explicitly opted-in synthetic databases inside the task-created container were used. The temporary container was removed after verification; no existing development database or container was reset, migrated or seeded.

## Genuine before/after observations and setup boundaries

The newly written first four browser regressions ran against the pre-fix application and failed in both viewport projects: **8 actual failures**. The R3 concurrency regression then ran against the pre-fix API: **1 failed / 17 not selected**, observing frozen members 11/13 instead of expected 11/12. After corrections those assertions passed, and coverage was expanded to ten isolated UI scenarios plus the invalid/empty snapshot scenario. These before/after runs happened locally in this task; no separate historical RED commit is fabricated. The fix commit contains both code and regression sources.

Two private test-configuration mistakes were rejected by existing safety guards before any test ran: an initial temporary database name did not match the required `lectra_test...` pattern, and the first foundation invocation lacked its explicit ALLOW_FOUNDATION_TESTS opt-in. New correctly named databases and the missing explicit opt-in corrected the setup. The actual R3 RED above came from a later valid isolated run, not from these setup errors. Neither guard was weakened and no assertion was removed to obtain a pass.

The earlier PDF and `docs/deliverable-1/review-snapshot.json` retain the earlier `1f7ae02` evidence and were not regenerated. They are historical review-draft artifacts, not evidence of this corrected source. Final report regeneration, assessed release linkage, complete STS dispositions and actual human contribution/acceptance remain separate gates under #22–#26.
