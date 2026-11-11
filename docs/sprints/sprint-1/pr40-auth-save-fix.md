# PR #40 — R40-01 authentication persistence correction

Recorded 2026-11-12 (Asia/Bangkok). The project owner relayed a teammate's private release review of staging `0737d8253271a91dd28cf10b5f348137abb54d58`. This is the supplied review's provenance; it is not a fabricated GitHub review or an independent teammate execution of the correction.

## Confirmed failure and correction

R40-01 / AC-F01-13 / TEST-F01-I18: the old store autocommitted the upstream session INSERT and then separately corrected its rounded expiry with UPDATE. Failure of that UPDATE returned login 503 while the authenticated row and newly issued cookie remained usable. A permanent real-PostgreSQL test reproduced all four observations: safe 503 response, issued usable cookie, persisted authenticated row, and `/me` 200 after restoring database operations.

RED test commit: `6d40e0c` (full reference in the verification record). The focused test ran against unchanged application source from staging. Its SQL trigger rejects an authenticated row only when its expiry equals the exact millisecond deadline: the old rounded INSERT commits, then the precise UPDATE fails. The corrected precise INSERT encounters the same trigger and rolls back atomically. The assertion is about failure outcomes, not a mocked query-count expectation. Clock uses a non-whole-second deadline to make the old failure deterministic.

Fix/test source: `cccb1c02973e3cee47fd10a63f6769b6523e9c6c`.

- Store session JSON and exact expiry in one parameterized PostgreSQL UPSERT. There is no separately committed expiry correction.
- On explicit save or login regeneration failure, remove the failed in-memory session before response completion and expire its cookie. This prevents express-session from sending the candidate cookie or retrying persistence while ending the error response.
- Retain safe 503 authentication envelopes. Logout destroy failures remain honestly reported; they can leave the old session usable until a successful deliberate retry. Do not falsely acknowledge revocation.
- No schema/dependency change, production fault endpoint, or browser behavior change.

## Actual validation and TDD history

[Machine-readable source/commands/results](pr40-auth-save-verification.json) records 144 selected passing tests: 37 unit, 2 liveness, 38 API/PostgreSQL, 9 foundation, 2 database tooling, 38 isolated HTTP/browser, 14 real browser/API/PostgreSQL and 4 smoke. Typecheck, build, actual ORM query and built-process stop/start also passed. Final matrix: zero failures or skips. This is pre-main verification on the fix commit, not a rerun of the historical 138-test source.

Permanent real-database checks add:

1. Precise authenticated persistence failure: 503, only absent/expired cookie, no additional authenticated row, agent/old guest/returned-cookie `/me` denied after restoring storage, and fresh explicit login succeeds.
2. Guest persistence failure: 503, no additional session row, no usable cookie, unauthorized `/me`, bootstrap recovery succeeds.
3. Unavailable session-table lookup and trusted User lookup, independently: safe 503/no-store, no fallback identity, existing session reads recover once storage is restored.
4. Failed regeneration and failed logout destroy, independently: safe 503, no newly usable cookie, unchanged row count, guest remains unauthorized; failed logout's existing authenticated session may remain usable, followed by successful deliberate retry.

The first expanded run had one failed assertion: regeneration failure still emitted a new uninitialized cookie. The correction now suppresses that cookie too. The original focused RED, intermediate observations and final results are retained separately; no failing history is rewritten as green. Raw RED logs contain synthetic SIDs and remain private/ignored; public evidence contains safe outcomes only. The six additional scenarios are 38 minus the original 32 API scenarios; repeats are not added to the unique-test total.

Database faults use private triggers/table renames inside the guarded disposable feature fixture, restored in `finally`. No user database, demo volume or credentials were changed. The historical 59-file hashes still describe their old candidate; the new verification record supplies the corresponding hashes for this correction.

## G-04 disposition register — release remains blocked

These are evidence-backed author proposals/statuses for actual reviewer acceptance, **not accepted waivers**. The historical [183-case inventory](issue-22-coverage.json) and [browser inventory](issue-23-browser-coverage.json) remain source-bound; nothing silently becomes full Pass or N/A. This table addresses the categories in the relayed review, not a claim that all planned subconditions are exhausted.

| Condition / planned reference | Actual evidence and status | Release decision / required action |
| --- | --- | --- |
| Failed session save/regeneration and auth get/User lookup/destroy: TEST-F01-I18, AC-F01-13 | New real-PostgreSQL cases above pass on `cccb1c0`; exact cookie/row/replay outcomes asserted. Historical full-case mapping not rewritten. | R40-01 correction requires actual teammate review/integration and exact resulting candidate check. No agent approval substitutes for that. |
| Verifier and extended failure permutations: TEST-F01-I26; connection-loss-after-commit uncertainty | Not established by the six new cases. Basic credential tests do not inject verifier exceptions or prove all uncertain-ack outcomes. | Remains unresolved; add focused evidence or obtain an actual reasoned reviewer disposition. Do not call all auth failure handling complete. |
| Draft mutation persistence/failure: TEST-F03-I20 / AC-F03-20 | Existing Draft save/publication lock-order checks pass again; they do not establish every create/reorder/delete/publish fault stage. | Applicable local S1 behavior; unresolved release decision. Review individual stages and add rollback/uncertain-outcome checks as needed. Not deferred automatically. |
| Concurrent read snapshots: TEST-F02-I18, TEST-F03-I24, TEST-F05-I10/I11 | Existing pagination, save/publication, Close/submit and exact results tests pass; they do not pause all count/items/parent/questions/results query boundaries. | Applicable snapshot guarantees remain unresolved until focused barrier evidence or actual reviewer-accepted reasoning. No waiver based on ordinary GETs. |
| Domain outage/deadlock: TEST-F02-I19, TEST-F03-I20, TEST-F04-I20, TEST-F05-I12 | Existing real response rollback/lock-timeout cases pass; new auth outage checks do not certify domain aggregation/comment outage stages or deadlock/unknown-commit permutations. | Uncovered required stages remain blockers pending evidence or explicit applicable disposition. A safe auth 503 does not prove safe domain errors. |
| Privacy/error logging: TEST-F01-I23, TEST-F04-I21 and relevant domain privacy cases | Existing role/ownership/allowlist/no-store/text rendering tests pass; new exact auth error-envelope checks pass. A secret-marker log-spy matrix was not executed here. | No full logging/privacy certification. Run missing applicable checks or retain an explicit reasoned decision for actual reviewer agreement. |
| Supplementary UI accessibility: TEST-F01-M01, TEST-F03-E05, TEST-F04-M01 and applicable feature UI cases | Existing real 360/1280 keyboard/error-focus/plain-text/overflow cases pass again. Complete zoom/assistive-technology/manual checks are not recorded by this run. | Review actual required SDS/AC checks separately; record real manual evidence or unresolved items. Optional P15 usability is not invented or used to waive required accessibility. |
| Deployed HTTPS/proxy profile and P15 sessions | This run is a local identified S1 profile. Later cloud/deployment/P15 work is outside this run; transport/config unit checks do not certify a deployed topology. | Proposed separation of later deployment/optional usability work requires scope-based reviewer agreement. It does not waive required local session/cookie/security behavior. |

For each accepted decision retain the exact planned ID/AC, applicability and reason, evidence/source, Pass/Fail/Not run/N/A, blocking status, required action, actual reviewer and reviewed version. Until those decisions and correction review are complete, PR #40 must not merge into main. #25 stays open through real main verification/tag; #26 owns final PDF/contribution evidence separately.
