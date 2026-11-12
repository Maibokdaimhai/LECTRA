# Complete Sprint 1 AC-to-planned/actual-test results

Assessed main: af2e1030984bcc816081b25b29c9de52a80efe30; tag sprint-1. All 113 S1 AC are listed. Runner results are selected assertions, not full-case certification. Actual release approval accepted the bounded G-04 dispositions; Partial/Not run/manual limitations remain explicit.

## AC-F01-01
Bootstrap returns a persisted session-bound token, correct guest/auth projection and no-store; repeated live bootstrap does not renew token/deadline.

**Planned STS:** TEST-F01-I01, TEST-F01-I27
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — TEST-F01-I01/I03/I04/I07: bootstrap persists; login regenerates SID/token and returns trusted projection; apps/api/tests/features/workflows.test.ts — DEEP40-02 advancing-clock guest/auth; DEEP40-03 exact fractional deadline
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F01-02
Exact login/logout schema and transport/decoded bounds reject malformed, oversized, unsupported or identity-spoofing bodies without authentication writes.

**Planned STS:** TEST-F01-U01, TEST-F01-I06, TEST-F01-I15
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — TEST-F01-I05/I15: generic credential errors, exact schemas and body security
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F01-03
Each seeded role can log in with exact password and normalized email; /me returns the trusted safe current identity.

**Planned STS:** TEST-F01-I03, TEST-F01-I04, TEST-F01-E01
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — TEST-F01-I01/I03/I04/I07: bootstrap persists; login regenerates SID/token and returns trusted projection; tests/browser/feedback.spec.ts — B23-02 real invalid then keyboard login and one StrictMode bootstrap [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F01-04
Unknown email and wrong password return the same 401 body without authenticated session; existing auth is not silently switched/renewed by login.

**Planned STS:** TEST-F01-I05, TEST-F01-I28
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — TEST-F01-I05/I15: generic credential errors, exact schemas and body security; apps/api/tests/features/workflows.test.ts — TEST-F01-I09/I28: trusted role is resolved anew and authenticated login does not switch accounts; tests/browser/feedback.spec.ts — B23-02 real invalid then keyboard login and one StrictMode bootstrap [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F01-05
Stored credentials are salted Argon2id; exact nontrimmed password verification succeeds/fails correctly; corruption/errors never grant identity.

**Planned STS:** TEST-F01-U06, TEST-F01-I24, TEST-F01-I26
**Actual executed mapping:** No direct case established by this mapping.
**Result / limitation:** No direct case established by this mapping; retain Not run/Partial boundary and actual G-04/process disposition; no full Pass claimed

## AC-F01-06
Successful login regenerates SID/token, destroys guest SID and waits for durable save; old token/SID cannot authenticate.

**Planned STS:** TEST-F01-I07, TEST-F01-I13
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — TEST-F01-I01/I03/I04/I07: bootstrap persists; login regenerates SID/token and returns trusted projection; apps/api/tests/features/workflows.test.ts — TEST-F01-I14/I22: old tokens fail; the eleventh valid-shape login is throttled; apps/api/tests/features/workflows.test.ts — DEEP40-02 advancing-clock guest/auth; DEEP40-03 exact fractional deadline
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F01-07
Auth is valid just before eight hours and denied exactly at/after it; reads/touch/save/restart cannot extend cookie/store/server deadline. Invalid/future timestamps fail.

**Planned STS:** TEST-F01-U02, TEST-F01-U07, TEST-F01-I08, TEST-F01-I20
**Actual executed mapping:** apps/api/tests/unit/auth-rules.test.ts — TEST-F01-U02: exact absolute deadline rejects expiry without renewal; apps/api/tests/unit/auth-rules.test.ts — TEST-F01-U07: future, missing and inconsistent timestamps cannot authenticate; apps/api/tests/features/workflows.test.ts — TEST-F01-I08/I16/I17: expiry is absolute and logout revokes a replayed cookie; scripts/verify-restart.ts — Actual built API process stop/start with unchanged database/secret, identity/deadline/survey/own answers/results comparison; apps/api/tests/features/workflows.test.ts — DEEP40-02 advancing-clock guest/auth; DEEP40-03 exact fractional deadline; tests/browser/sprint1-recovery-states.spec.ts — B23-05 real expiry clears unsaved private state and ignores a delayed older read; logout survives reload [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F01-08
Every protected request resolves trusted User/role; deleted/invalid users lose auth and client identity claims never elevate permission.

**Planned STS:** TEST-F01-I09, TEST-F01-I15
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — TEST-F01-I09/I28: trusted role is resolved anew and authenticated login does not switch accounts; apps/api/tests/features/workflows.test.ts — TEST-F01-I05/I15: generic credential errors, exact schemas and body security
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F01-09
Confirmed logout revokes the stored session; cookie replay is unauthorized; repeated/absent-session logout follows the documented token no-op policy.

**Planned STS:** TEST-F01-I16, TEST-F01-I17, TEST-F01-E02
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — TEST-F01-I08/I16/I17: expiry is absolute and logout revokes a replayed cookie; tests/browser/logout-csrf-rotation.spec.ts — PR45-CSRF real expiry/native guest-cookie/failure/deliberate current-token retry; tests/browser/sprint1-recovery-states.spec.ts — B23-05 real expiry clears unsaved private state and ignores a delayed older read; logout survives reload [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F01-10
Login/logout/unsafe routes enforce exact Origin and session-bound CSRF, including cross-session/old-token rejection and the explicit logout-only no-op branch.

**Planned STS:** TEST-F01-U03, TEST-F01-I13, TEST-F01-I14, TEST-F01-I17, TEST-F01-E04
**Actual executed mapping:** apps/api/tests/unit/auth-rules.test.ts — TEST-F01-U03: malformed and cross-session CSRF tokens are rejected; apps/api/tests/features/workflows.test.ts — TEST-F01-I14/I22: old tokens fail; the eleventh valid-shape login is throttled; apps/api/tests/features/workflows.test.ts — TEST-F01-I08/I16/I17: expiry is absolute and logout revokes a replayed cookie
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F01-11
Local HTTP versus HTTPS cookies, clearing and validated proxy/configuration behave as specified; spoofed forwarded headers do not make an insecure caller trusted.

**Planned STS:** TEST-F01-I02, TEST-F01-I25, TEST-F01-M02
**Actual executed mapping:** No direct case established by this mapping.
**Result / limitation:** No direct case established by this mapping; retain Not run/Partial boundary and actual G-04/process disposition; no full Pass claimed

## AC-F01-12
Guard boundary gives unauthenticated 401, authenticated wrong-role 403 and missing/out-of-scope 404 without private data. Real domain integrations remain explicitly assigned.

**Planned STS:** TEST-F01-U04, TEST-F01-I10, TEST-F01-I11, TEST-F01-I12, TEST-F01-H01, TEST-F01-H02, TEST-F01-H03, TEST-F01-H04
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-01: unsupported methods, foreign origins and forged cookies fail without authority; apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data; apps/api/tests/features/workflows.test.ts — F-02: owner context is scoped even within a shared Course, and query pagination is strict; tests/browser/sprint1-rejections.spec.ts — B23-04 genuine browser sessions reject wrong role, foreign Course owner and guest access [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F01-13
DB/store/verifier failures produce safe failure, never memory fallback or successful login/logout acknowledgement; failed revocation remains disclosed/retryable.

**Planned STS:** TEST-F01-I18, TEST-F01-I26, TEST-F01-E05
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-01: session-store failures return safe 503 and never create a memory fallback; tests/browser/logout-csrf-rotation.spec.ts — PR45-CSRF real expiry/native guest-cookie/failure/deliberate current-token retry
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F01-14
Auth errors/identity projections/logs/cache behavior expose no credentials, SID, other-user payload or private cached content after session loss.

**Planned STS:** TEST-F01-U05, TEST-F01-I23, TEST-F01-E02, TEST-F01-E03
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data; tests/browser/sprint1-recovery-states.spec.ts — B23-05 real expiry clears unsaved private state and ignores a delayed older read; logout survives reload [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F01-15
Login has usable labelled/keyboard/busy/error/timeout behavior and server-derived role navigation at the specified widths.

**Planned STS:** TEST-F01-E01, TEST-F01-E04, TEST-F01-M01
**Actual executed mapping:** tests/browser/feedback.spec.ts — B23-02 real invalid then keyboard login and one StrictMode bootstrap [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F01-16
Session expiry/logout hides private UI, rechecks before protected re-entry and distinguishes server-revocation failure from success.

**Planned STS:** TEST-F01-E02, TEST-F01-E03, TEST-F01-E05
**Actual executed mapping:** tests/browser/logout-csrf-rotation.spec.ts — PR45-CSRF real expiry/native guest-cookie/failure/deliberate current-token retry; tests/browser/sprint1-recovery-states.spec.ts — B23-05 real expiry clears unsaved private state and ignores a delayed older read; logout survives reload [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F01-17
Reviewed migration/seed and test-DB safeguards reproduce User/session storage; sessions survive restart with unchanged absolute deadline.

**Planned STS:** TEST-F01-I20, TEST-F01-I24, TEST-F01-I25, TEST-F01-M02
**Actual executed mapping:** scripts/verify-restart.ts — Actual built API process stop/start with unchanged database/secret, identity/deadline/survey/own answers/results comparison
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F01-18
The tenth allowed attempt and eleventh rejected attempt/reset behave under the documented per-process limiter; public distributed limitation is explicit.

**Planned STS:** TEST-F01-I22
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — TEST-F01-I14/I22: old tokens fail; the eleventh valid-shape login is throttled
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F01-19
Concurrent session reads do not resurrect a revoked session; logging out one independent session does not revoke another.

**Planned STS:** TEST-F01-I19, TEST-F01-I21
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — TEST-F01-I19/I21: reads overlapping logout never resurrect the cookie; independent sessions remain usable; tests/browser/logout-csrf-rotation.spec.ts — PR45-CSRF real expiry/native guest-cookie/failure/deliberate current-token retry
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F01-20
Preimplementation contract/test-design versions, reviewed Product DoD, actual test results and substantive teammate integration are linked before F-01 is called Done.

**Planned STS:** TEST-F01-M03
**Actual executed mapping:** No direct case established by this mapping.
**Result / limitation:** No direct case established by this mapping; retain Not run/Partial boundary and actual G-04/process disposition; no full Pass claimed

## AC-F02-01
Reproducible synthetic hierarchy satisfies required roles/FKs/unique relationships; #16 owns its schema without duplicate auth/domain tables.

**Planned STS:** TEST-F02-I01, TEST-F02-M02
**Actual executed mapping:** No direct case established by this mapping.
**Result / limitation:** No direct case established by this mapping; retain Not run/Partial boundary and actual G-04/process disposition; no full Pass claimed

## AC-F02-02
All reads require trusted F-01 identity; owner context routes reject respondents before resource detail; client actor data grants nothing.

**Planned STS:** TEST-F02-I02, TEST-F02-I03
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-02: owner context is scoped even within a shared Course, and query pagination is strict; tests/browser/sprint1-rejections.spec.ts — B23-04 genuine browser sessions reject wrong role, foreign Course owner and guest access [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F02-03
Course list contains exactly Courses having an owned Section, once each, without cross-owner data/counts.

**Planned STS:** TEST-F02-I04
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-02: owner context is scoped even within a shared Course, and query pagination is strict
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F02-04
Section list requires owned Course access and returns only own Sections; missing/foreign-only parent is indistinguishable 404.

**Planned STS:** TEST-F02-I05
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-02: owner context is scoped even within a shared Course, and query pagination is strict
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F02-05
Lecture list requires owned Section access, supports empty Sections and exposes only the authorized existing-survey reference.

**Planned STS:** TEST-F02-I06
**Actual executed mapping:** No direct case established by this mapping.
**Result / limitation:** No direct case established by this mapping; retain Not run/Partial boundary and actual G-04/process disposition; no full Pass claimed

## AC-F02-06
Owner survey list is Section-scoped across all three states; optional lecture selection cannot broaden ownership or reveal another Section's survey.

**Planned STS:** TEST-F02-I07
**Actual executed mapping:** No direct case established by this mapping.
**Result / limitation:** No direct case established by this mapping; retain Not run/Partial boundary and actual G-04/process disposition; no full Pass claimed

## AC-F02-07
Respondent list includes only own-eligible Published/Closed surveys and never Draft or unrelated context.

**Planned STS:** TEST-F02-I08, TEST-F02-I09
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities; tests/browser/sprint1-rejections.spec.ts — B23-04 genuine browser sessions reject wrong role, foreign Course owner and guest access [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F02-08
Post-publication Membership changes do not add/remove discovery eligibility; only frozen eligibility controls it.

**Planned STS:** TEST-F02-I10
**Actual executed mapping:** No direct case established by this mapping.
**Result / limitation:** No direct case established by this mapping; retain Not run/Partial boundary and actual G-04/process disposition; no full Pass claimed

## AC-F02-09
Each respondent sees only their persisted submitted boolean; another student's participation never changes it.

**Planned STS:** TEST-F02-I11, TEST-F02-H02
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data; apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F02-10
Exact safe projections exclude questions/answers/results/identities/session/private fields; text is plain, owner participation absent.

**Planned STS:** TEST-F02-U02, TEST-F02-I12
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-11: scoped pagination retains totals/order at default, final and beyond-last pages and rejects malformed bounds; apps/api/tests/features/workflows.test.ts — N4: explicitly empty lecture filter fails validation instead of returning all surveys
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F02-11
Exact query/UUID syntax, duplicate/unknown fields, GET bodies and deferred history filters are rejected safely without domain writes.

**Planned STS:** TEST-F02-U01, TEST-F02-I13
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-11: scoped pagination retains totals/order at default, final and beyond-last pages and rejects malformed bounds; apps/api/tests/features/workflows.test.ts — N4: explicitly empty lecture filter fails validation instead of returning all surveys
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F02-12
Pagination defaults/bounds and authorized totals are correct; empty/out-of-range pages do not expose another actor's counts.

**Planned STS:** TEST-F02-U03, TEST-F02-I14, TEST-F02-I16
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-11: scoped pagination retains totals/order at default, final and beyond-last pages and rejects malformed bounds; apps/api/tests/features/workflows.test.ts — N4: explicitly empty lecture filter fails validation instead of returning all surveys
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F02-13
Stable documented ordering/tiebreakers produce repeatable unchanged-data pages and preserve calendar dates.

**Planned STS:** TEST-F02-I15
**Actual executed mapping:** No direct case established by this mapping.
**Result / limitation:** No direct case established by this mapping; retain Not run/Partial boundary and actual G-04/process disposition; no full Pass claimed

## AC-F02-14
Owner/Respondent empty/loading/availability distinctions and parent-reset/page actions match server data without invented workflow success.

**Planned STS:** TEST-F02-I16, TEST-F02-E01, TEST-F02-E02
**Actual executed mapping:** tests/browser/sprint1-recovery-states.spec.ts — B23-07 real empty contexts and zero results distinguish held loading, delivery error and successful retry [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F02-15
Retry, permission/session-loss and superseded-request behavior never restores unrelated/private stale content or treats failure as empty success.

**Planned STS:** TEST-F02-E03, TEST-F02-E04
**Actual executed mapping:** tests/browser/sprint1-recovery-states.spec.ts — B23-07 real empty contexts and zero results distinguish held loading, delivery error and successful retry [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F02-16
Both list journeys are labelled, keyboard-operable and usable at 360px/1280px with visible focus and wrapped content.

**Planned STS:** TEST-F02-E01, TEST-F02-E02, TEST-F02-M01
**Actual executed mapping:** No direct case established by this mapping.
**Result / limitation:** No direct case established by this mapping; retain Not run/Partial boundary and actual G-04/process disposition; no full Pass claimed

## AC-F02-17
Reads leave domain data unchanged; one response's count/items/participation use a consistent committed snapshot during publication/submission.

**Planned STS:** TEST-F02-I17, TEST-F02-I18
**Actual executed mapping:** No direct case established by this mapping.
**Result / limitation:** No direct case established by this mapping; retain Not run/Partial boundary and actual G-04/process disposition; no full Pass claimed

## AC-F02-18
Database/auth dependency failure produces the safe defined error, no-store and no private diagnostics, not a fabricated empty collection.

**Planned STS:** TEST-F02-I19, TEST-F02-E04
**Actual executed mapping:** tests/browser/sprint1-recovery-states.spec.ts — B23-07 real empty contexts and zero results distinguish held loading, delivery error and successful retry [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F02-19
Actions derive from current state/own status; target features revalidate stale/ineligible requests; no F-03/F-04 write is implemented in F-02.

**Planned STS:** TEST-F02-U04, TEST-F02-I20, TEST-F02-H01, TEST-F02-H02
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-03: one-survey uniqueness, stable definitions/revisions, foreign owner rejection and publication snapshot; apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F02-20
Accepted contract/STS/DoD, actual setup/test/history and substantive teammate integration are linked before claiming F-02 Done.

**Planned STS:** TEST-F02-M02
**Actual executed mapping:** No direct case established by this mapping.
**Result / limitation:** No direct case established by this mapping; retain Not run/Partial boundary and actual G-04/process disposition; no full Pass claimed

## AC-F03-01
Creating on an owned empty Lecture returns 201 empty IDENTIFIED Draft revision 1, canonical owner and committed definition retrievable by GET.

**Planned STS:** TEST-F03-I01
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-02
All six routes enforce §2 server-side; foreign-owner records are 404, Respondent management 403, unauthenticated access 401, with no mutation or private data.

**Planned STS:** TEST-F03-I02, TEST-F03-I23
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data; tests/browser/sprint1-rejections.spec.ts — B23-04 genuine browser sessions reject wrong role, foreign Course owner and guest access [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-03
Concurrent creates for one Lecture yield exactly one Survey; committed winner 201 and conflicting loser 409.

**Planned STS:** TEST-F03-I03
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-01: concurrent create produces one Draft and one conflict for the same owned lecture
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-04
Owner reads own three states; Respondent reads only frozen-eligible Published/Closed, never Draft. Projections, question order and disclosure match §5.2; no participant/answer/owner-identity leak.

**Planned STS:** TEST-F03-U06, TEST-F03-I04, TEST-F03-I24, TEST-F03-E04
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-03: one-survey uniqueness, stable definitions/revisions, foreign owner rejection and publication snapshot; tests/browser/sprint1-rejections.spec.ts — B23-03 genuine stale forms reject duplicate and Closed submissions without extra rows [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-05
Save atomically adds/edits/removes/reorders questions with retained stable IDs and contiguous positions; invalid/foreign/duplicate IDs cause 422 and no change.

**Planned STS:** TEST-F03-U05, TEST-F03-I05
**Actual executed mapping:** tests/browser/ui-accessibility-real.spec.ts — UI-F01/F02 real Draft rejection retains fields and keyboard reorder persists [real; includes 320px/native 200% zoom]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-06
Normalization and Unicode limits in §4 accept exact bounds and reject one over; Draft blanks allowed, publication blanks rejected, malformed Unicode/NUL safely rejected.

**Planned STS:** TEST-F03-U01, TEST-F03-I06
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-03: one-survey uniqueness, stable definitions/revisions, foreign owner rejection and publication snapshot; tests/browser/ui-accessibility-real.spec.ts — UI-F01/F02 real Draft rejection retains fields and keyboard reorder persists [real; includes 320px/native 200% zoom]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-07
RATING/TEXT and required booleans follow §4; 1–5 scale fixed, labels/interpretation preserved; malformed scales, coercions and unsupported types return 422.

**Planned STS:** TEST-F03-U02, TEST-F03-I07
**Actual executed mapping:** No direct case established by this mapping.
**Result / limitation:** No direct case established by this mapping; retain Not run/Partial boundary and actual G-04/process disposition; no full Pass claimed

## AC-F03-08
Save accepts 0–10 questions; publication rejects 0/text-only, accepts valid 1 or 10 with RATING, and rejects 11. No failed publication creates eligibility/state changes.

**Planned STS:** TEST-F03-U03, TEST-F03-I08
**Actual executed mapping:** No direct case established by this mapping.
**Result / limitation:** No direct case established by this mapping; retain Not run/Partial boundary and actual G-04/process disposition; no full Pass claimed

## AC-F03-09
Real change increments once; normalized no-op with current revision does not. Stale writes conflict; concurrent real saves with same revision have one winner and no lost update.

**Planned STS:** TEST-F03-U04, TEST-F03-I09
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-03: one-survey uniqueness, stable definitions/revisions, foreign owner rejection and publication snapshot
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-10
Matching-revision Draft delete returns 204 and removes only its definition; stale delete 409, absent 404, Published/Closed 409; Lecture can receive a new Draft afterward.

**Planned STS:** TEST-F03-I10
**Actual executed mapping:** No direct case established by this mapping.
**Result / limitation:** No direct case established by this mapping; retain Not run/Partial boundary and actual G-04/process disposition; no full Pass claimed

## AC-F03-11
Only DRAFT→PUBLISHED→CLOSED is allowed. Published/Closed definitions, modes and eligibility cannot be edited/deleted/reopened; invalid transitions are 409 for valid-shaped requests.

**Planned STS:** TEST-F03-U04, TEST-F03-I11, TEST-F03-E04
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-02: frozen eligibility survives live membership changes and definitions remain immutable
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-12
Valid publication commits full frozen definition and exactly the selected eligible snapshot together; no partial state visible.

**Planned STS:** TEST-F03-I12, TEST-F03-H01
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-03: one-survey uniqueness, stable definitions/revisions, foreign owner rejection and publication snapshot; apps/api/tests/features/workflows.test.ts — INT22-02: frozen eligibility survives live membership changes and definitions remain immutable; apps/api/tests/features/workflows.test.ts — F-02: owner context is scoped even within a shared Course, and query pagination is strict
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-13
Empty eligibility or invalid member roles prevent publication with 422 and unchanged Draft/zero snapshot rows.

**Planned STS:** TEST-F03-U03, TEST-F03-I13
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — R3: invalid and empty membership snapshots leave the Draft and eligibility unchanged
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-14
After publication, membership changes do not alter frozen access; required/type/scale/order/mode stay fixed and identified disclosure remains truthful for F-04/F-05.

**Planned STS:** TEST-F03-U06, TEST-F03-I11, TEST-F03-I14, TEST-F03-H03
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-02: frozen eligibility survives live membership changes and definitions remain immutable; apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-15
Controlled edit/publish races produce exactly §7's two outcomes: save-first revision conflict or publish-first invalid-state rejection, never mixed published content.

**Planned STS:** TEST-F03-I15
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-10: held-row barriers exercise both Draft save/publication orders with complete frozen revisions
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-16
Controlled membership/publish tests prove the one-statement snapshot boundary before/after committed changes, including invisible uncommitted changes.

**Planned STS:** TEST-F03-I16
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — R3: publication validates and freezes one membership snapshot while membership changes concurrently
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-17
Authorized Close changes Published to Closed once, retains publishedAt/revision and all questions/eligibility/responses, and sets closedAt only on success.

**Planned STS:** TEST-F03-I17, TEST-F03-H03
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-18
Sequential and concurrent duplicate publish/close produce one successful transition and subsequent 409, without timestamp/snapshot duplication or rewriting. Concurrent publish/close from Draft follows §7: close-first 409 then Published; publish-first permits subsequent Closed.

**Planned STS:** TEST-F03-U04, TEST-F03-I18
**Actual executed mapping:** No direct case established by this mapping.
**Result / limitation:** No direct case established by this mapping; retain Not run/Partial boundary and actual G-04/process disposition; no full Pass claimed

## AC-F03-19
Close/submit follows BR-11's lock/commit order; close-first rejects submission without rows, submit-first response survives closing. A protocol harness alone is not actual F-04 integration evidence.

**Planned STS:** TEST-F03-I19, TEST-F03-H02
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-03/F-04: actual API close and submit serialize correctly in both lock orders
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-20
Injected write/known precommit failures leave no partial definition/order/snapshot/state changes; safe error, no success. Unknown commit outcome triggers reconciliation, not a fabricated rollback claim.

**Planned STS:** TEST-F03-I20
**Actual executed mapping:** No direct case established by this mapping.
**Result / limitation:** No direct case established by this mapping; retain Not run/Partial boundary and actual G-04/process disposition; no full Pass claimed

## AC-F03-21
Shared session/Origin/CSRF/access, route body ceilings, strict JSON/error precedence, safe logs and no-store responses follow §5; spoofed actor/mode cannot bypass checks.

**Planned STS:** TEST-F03-I21, TEST-F03-I23
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — N4: explicitly empty lecture filter fails validation instead of returning all surveys; apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-22
Owner completes real create/save/publish and Published/Closed read-only navigation with persisted state confirmation, no premature success.

**Planned STS:** TEST-F03-E01, TEST-F03-E04
**Actual executed mapping:** tests/browser/feedback.spec.ts — B23-01 real owner → student → closed results, persisted reload/relogin and validation [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-23
Validation, state/revision conflicts and network uncertainty show §8 recovery without automatic overwrite or false success; recoverable unsaved content retained, session loss clears private state.

**Planned STS:** TEST-F03-E02, TEST-F03-E03
**Actual executed mapping:** tests/browser/ui-accessibility-real.spec.ts — UI-F01/F02 real Draft rejection retains fields and keyboard reorder persists [real; includes 320px/native 200% zoom]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-24
Core authoring/publication/closing controls are labelled, keyboard usable, focus/error handling visible at 360px and 1280px.

**Planned STS:** TEST-F03-E05, TEST-F03-M01
**Actual executed mapping:** tests/browser/feedback.spec.ts — B23-01 real owner → student → closed results, persisted reload/relogin and validation [real browser/API/PostgreSQL; selected assertions]; tests/browser/ui-accessibility-real.spec.ts — UI-F01/F02 real Draft rejection retains fields and keyboard reorder persists [real; includes 320px/native 200% zoom]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-25
After process restart against the same PostgreSQL database, committed Draft/Published/Closed definitions, IDs/order/revisions/timestamps and snapshots remain unchanged.

**Planned STS:** TEST-F03-I22
**Actual executed mapping:** scripts/verify-restart.ts — Actual built API process stop/start with unchanged database/secret, identity/deadline/survey/own answers/results comparison
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F03-26
Before implementation, reviewed contract/schema/security/handoff agreements exist; later acceptance has actual mapped unit/API/PostgreSQL/E2E/handoff results, meaningful RED/GREEN and human review, with pending work explicit.

**Planned STS:** TEST-F03-M02, TEST-F03-H01, TEST-F03-H02, TEST-F03-H03
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-02: frozen eligibility survives live membership changes and definitions remain immutable; apps/api/tests/features/workflows.test.ts — F-02: owner context is scoped even within a shared Course, and query pagination is strict; apps/api/tests/features/workflows.test.ts — F-03/F-04: actual API close and submit serialize correctly in both lock orders; apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-01
Eligible Published identified survey renders F-03 frozen definitions/disclosure and current own status, without creating another definition API.

**Planned STS:** TEST-F04-E01, TEST-F04-H01
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-03/F-04: actual API close and submit serialize correctly in both lock orders; tests/browser/feedback.spec.ts — B23-01 real owner → student → closed results, persisted reload/relogin and validation [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-02
Required/optional ratings are strict integers 1-5, with no default/coercion/optional zero; missing required rejects.

**Planned STS:** TEST-F04-U01, TEST-F04-I02, TEST-F04-I03, TEST-F04-E02
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-04: required/type/Unicode/association boundaries reject without any partial response; tests/browser/feedback.spec.ts — B23-01 real owner → student → closed results, persisted reload/relogin and validation [real browser/API/PostgreSQL; selected assertions]; tests/browser/ui-accessibility-real.spec.ts — UI-F02/F03 real rejection, retained text, confirmed success focus and Closed results [real; includes 320px/native 200% zoom]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-03
Text preserves valid nonblank content, enforces code-point/blank/NUL/surrogate rules and normalizes bounded optional blank to absence.

**Planned STS:** TEST-F04-U02, TEST-F04-I04, TEST-F04-E02
**Actual executed mapping:** apps/api/tests/unit/feedback-rules.test.ts — F-04: accepts 2000 Unicode code points, preserves nonblank text, rejects 2001 and malformed Unicode; apps/api/tests/features/workflows.test.ts — INT22-05: real UTF-8 and surrogate-escaped text enforce code-point boundaries before persistence; tests/browser/ui-accessibility-real.spec.ts — UI-F02/F03 real rejection, retained text, confirmed success focus and Closed results [real; includes 320px/native 200% zoom]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-04
Unknown/duplicate/wrong-survey IDs, wrong type and empty normalized response reject without partial persistence.

**Planned STS:** TEST-F04-U03, TEST-F04-U05, TEST-F04-I05, TEST-F04-I06
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-04: required/type/Unicode/association boundaries reject without any partial response
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-05
256 KiB byte/compression/parser and decoded limits are independent; supported UTF-8/escaped maximum fits and oversized request writes nothing.

**Planned STS:** TEST-F04-I07
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-07: exact chunked transport ceiling is accepted; oversized, compressed and malformed bodies never write
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-06
Actor is server-resolved; guest/wrong-role/spoofed identity cannot submit/read for another account.

**Planned STS:** TEST-F04-I08, TEST-F04-I17
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data; tests/browser/sprint1-rejections.spec.ts — B23-04 genuine browser sessions reject wrong role, foreign Course owner and guest access [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-07
Frozen eligibility controls both endpoints despite later Membership changes; Draft/ineligible/missing remains hidden.

**Planned STS:** TEST-F04-I09
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-02: frozen eligibility survives live membership changes and definitions remain immutable
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-08
Closed/non-Published requests never create a response; documented state/duplicate precedence holds.

**Planned STS:** TEST-F04-I10, TEST-F04-I11
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-04/F-05: concurrent duplicate submits persist exactly one result; privacy projection and close ordering; tests/browser/sprint1-rejections.spec.ts — B23-03 genuine stale forms reject duplicate and Closed submissions without extra rows [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-09
Valid POST commits one Participation/bundle/all normalized typed answers and returns only persisted own data in question-position order.

**Planned STS:** TEST-F04-U06, TEST-F04-I01
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities; tests/browser/ui-accessibility-real.spec.ts — UI-F02/F03 real rejection, retained text, confirmed success focus and Closed results [real; includes 320px/native 200% zoom]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-10
Sequential repeat returns duplicate conflict without second/changed response.

**Planned STS:** TEST-F04-I11
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-04/F-05: concurrent duplicate submits persist exactly one result; privacy projection and close ordering; tests/browser/sprint1-rejections.spec.ts — B23-03 genuine stale forms reject duplicate and Closed submissions without extra rows [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-11
Concurrent same-student submit produces exactly one success/committed bundle; loser safely rejected.

**Planned STS:** TEST-F04-I12
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-04/F-05: concurrent duplicate submits persist exactly one result; privacy projection and close ordering
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-12
Invalid item or forced failure at each write phase leaves no partial rows or success confirmation.

**Planned STS:** TEST-F04-I02, TEST-F04-I13
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-04: required/type/Unicode/association boundaries reject without any partial response; apps/api/tests/features/workflows.test.ts — INT22-04: faults after each response write stage roll back all rows and permit one valid retry
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-13
Real Survey lock order determines close-first rejection versus submit-first inclusion; no timestamp/arrival shortcut.

**Planned STS:** TEST-F04-I14, TEST-F04-I15, TEST-F04-H01
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-03/F-04: actual API close and submit serialize correctly in both lock orders
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-14
Frozen definitions/required flags/scale are consumed without update; no response edit/delete/reopen operation exists.

**Planned STS:** TEST-F04-I18, TEST-F04-H01
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data; apps/api/tests/features/workflows.test.ts — F-03/F-04: actual API close and submit serialize correctly in both lock orders
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-15
Own false/true status and persisted identified answers survive closure/logout-login/restart; consistent read does not fabricate integrity recovery.

**Planned STS:** TEST-F04-I16, TEST-F04-E01
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-09: inconsistent own participation/bundle fails closed without data, and an empty Closed survey has null results; scripts/verify-restart.ts — Actual built API process stop/start with unchanged database/secret, identity/deadline/survey/own answers/results comparison; tests/browser/feedback.spec.ts — B23-01 real owner → student → closed results, persisted reload/relogin and validation [real browser/API/PostgreSQL; selected assertions]; tests/browser/sprint1-rejections.spec.ts — B23-03 genuine stale forms reject duplicate and Closed submissions without extra rows [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-16
Other-student lookup, forged query/body identity and owner respondent-linked access are denied without leakage.

**Planned STS:** TEST-F04-I17, TEST-F04-I21
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data; tests/browser/sprint1-rejections.spec.ts — B23-04 genuine browser sessions reject wrong role, foreign Course owner and guest access [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-17
UI pending/confirmation/readonly states reflect real API outcomes; no duplicate UI POST or premature success.

**Planned STS:** TEST-F04-E01, TEST-F04-E02
**Actual executed mapping:** tests/browser/feedback.spec.ts — B23-01 real owner → student → closed results, persisted reload/relogin and validation [real browser/API/PostgreSQL; selected assertions]; tests/browser/sprint1-rejections.spec.ts — B23-03 genuine stale forms reject duplicate and Closed submissions without extra rows [real browser/API/PostgreSQL; selected assertions]; tests/browser/sprint1-recovery-states.spec.ts — B23-06 real committed POST loses delivery and remains blocked until real persisted reconciliation [real browser/API/PostgreSQL; selected assertions]; tests/browser/ui-accessibility-real.spec.ts — UI-F02/F03 real rejection, retained text, confirmed success focus and Closed results [real; includes 320px/native 200% zoom]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-18
Ambiguous acknowledgement queries own persisted status before deliberate retry; no automatic response resend.

**Planned STS:** TEST-F04-I20, TEST-F04-E03
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-08: a real held Survey lock returns safe timeout with zero rows, then a deliberate retry succeeds; tests/browser/sprint1-recovery-states.spec.ts — B23-06 real committed POST loses delivery and remains blocked until real persisted reconciliation [real browser/API/PostgreSQL; selected assertions]; tests/browser/ui-accessibility-real.spec.ts — UI-F02/F03 real rejection, retained text, confirmed success focus and Closed results [real; includes 320px/native 200% zoom]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-19
Auth/Origin/CSRF/method/schema/state errors match exact codes/precedence with no database/internal/input exposure.

**Planned STS:** TEST-F04-U04, TEST-F04-I10, TEST-F04-I18, TEST-F04-I20
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-04/F-05: concurrent duplicate submits persist exactly one result; privacy projection and close ordering; apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data; apps/api/tests/features/workflows.test.ts — INT22-08: a real held Survey lock returns safe timeout with zero rows, then a deliberate retry succeeds; tests/browser/sprint1-rejections.spec.ts — B23-03 genuine stale forms reject duplicate and Closed submissions without extra rows [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-20
Private response data is absent from caches/storage/logs/other-user payloads; expiry/logout removes stale client content.

**Planned STS:** TEST-F04-I21, TEST-F04-E04
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data; tests/browser/sprint1-recovery-states.spec.ts — B23-05 real expiry clears unsaved private state and ignores a delayed older read; logout survives reload [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-21
Reviewed real schema enforces relevant FK/unique/range/typed-column invariants with atomic backend cross-table checks.

**Planned STS:** TEST-F04-I19
**Actual executed mapping:** No direct case established by this mapping.
**Result / limitation:** No direct case established by this mapping; retain Not run/Partial boundary and actual G-04/process disposition; no full Pass claimed

## AC-F04-22
Unsupported mode never stores or reveals an identified/anonymous fallback; no extra student-linked anonymous retrieval.

**Planned STS:** TEST-F04-I10
**Actual executed mapping:** apps/api/tests/post-release/ac-gaps.test.ts - PR46-I01 / AC-F04-22 / TEST-F04-I10: ANONYMOUS duplicate POST rejects mode before duplicate without writes [PASS; additional post-release run]; apps/api/tests/post-release/ac-gaps.test.ts - PR46-I04-PUBLISHED / AC-F04-22 / TEST-F04-I10: ANONYMOUS own readback rejects without identified-answer fallback [FAIL; additional post-release run]; apps/api/tests/post-release/ac-gaps.test.ts - PR46-I04-CLOSED / AC-F04-22 / TEST-F04-I10: ANONYMOUS own readback rejects without identified-answer fallback [FAIL; additional post-release run]
**Result / limitation:** Partial (Sprint 1). Additional post-release PR46-I01 PASS directly verifies unsupported ANONYMOUS submissions are rejected. Team decision: PR46-DEF-01 is a Known Limitation discovered during additional post-release verification. PR46-I04-PUBLISHED and PR46-I04-CLOSED are two observations of the same underlying unsupported-mode own-readback defect. AC-F04-22 remains a Sprint 1 AC with Partial disposition. Correction is deferred for team follow-up in Sprint 2 before enabling F-06 Anonymous Mode; regression tests must be rerun after correction. The defect is not fixed. The existing Sprint Plan and original assessed release are unchanged. Both failing readback results remain retained in the separate post-release investigation record.

## AC-F04-23
F-02 participation flag and F-05 count/denominator/text projections match actual committed normalized rows.

**Planned STS:** TEST-F04-H02, TEST-F04-H03
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities; tests/browser/feedback.spec.ts — B23-01 real owner → student → closed results, persisted reload/relogin and validation [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F04-24
Accepted contract/STS/DoD, real meaningful RED/GREEN, mapped outcomes, opposite-member review/integration and limitations precede feature Done.

**Planned STS:** TEST-F04-M02
**Actual executed mapping:** No direct case established by this mapping.
**Result / limitation:** No direct case established by this mapping; retain Not run/Partial boundary and actual G-04/process disposition; no full Pass claimed

## AC-F04-25
Core form/readback/errors support labelled keyboard/focus and narrow/wide layouts with truthful identified disclosure.

**Planned STS:** TEST-F04-E01, TEST-F04-E02, TEST-F04-E04, TEST-F04-M01
**Actual executed mapping:** tests/browser/feedback.spec.ts — B23-01 real owner → student → closed results, persisted reload/relogin and validation [real browser/API/PostgreSQL; selected assertions]; tests/browser/ui-accessibility-real.spec.ts — UI-F02/F03 real rejection, retained text, confirmed success focus and Closed results [real; includes 320px/native 200% zoom]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-01
Own Draft results GET is 409 RESULTS_NOT_AVAILABLE with no statistics; UI shows unavailable, never invented zeros.

**Planned STS:** TEST-F05-U04, TEST-F05-I02, TEST-F05-E02
**Actual executed mapping:** apps/api/tests/post-release/ac-gaps.test.ts - PR46-I02 / AC-F05-01 / TEST-F05-I02: own Draft results reject state before mode without statistics or mutation [PASS; additional post-release run]
**Result / limitation:** Additional post-release API PASS: PR46-I02 confirms own Draft GET results returns exact 409 RESULTS_NOT_AVAILABLE with no statistics or persisted mutation, including Draft-before-mode precedence. Foreign-owner and wrong-role denials remain 404/403. UI unavailable-state TEST-F05-E02 is not executed by this API check; the broader STS/AC remains Partial. Original historical results unchanged.

## AC-F05-02
Own identified Published GET returns exactly survey metadata and committed responseCount, including real zero; no answer/comment query or quantitative payload/DOM.

**Planned STS:** TEST-F05-U04, TEST-F05-I02, TEST-F05-I10, TEST-F05-E02
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data; apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities; tests/browser/feedback.spec.ts — B23-01 real owner → student → closed results, persisted reload/relogin and validation [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-03
Own identified Closed GET returns full ordered frozen question results and identified comments; low counts are not suppressed and stored data is unchanged.

**Planned STS:** TEST-F05-U04, TEST-F05-I02, TEST-F05-I11, TEST-F05-E01
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data; apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities; tests/browser/feedback.spec.ts — B23-01 real owner → student → closed results, persisted reload/relogin and validation [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-04
Unauthenticated 401, Respondent 403, foreign/missing Survey 404, including same Course/different Owner; direct calls and guessed IDs cannot bypass it.

**Planned STS:** TEST-F05-U04, TEST-F05-I01, TEST-F05-I09, TEST-F05-H02
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data; apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-05
UUID/body/query/method/Origin and error precedence follow §4.3; safe messages do not reveal private records or echo inputs.

**Planned STS:** TEST-F05-I01, TEST-F05-I08, TEST-F05-I09
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data; apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-06
responseCount equals committed distinct participating respondents, not eligibility, bundles/answers or current membership; joins cannot multiply it.

**Planned STS:** TEST-F05-U01, TEST-F05-I03, TEST-F05-I10, TEST-F05-I14
**Actual executed mapping:** apps/api/tests/unit/feedback-rules.test.ts — F-05: exact half-up two-decimal means use only actually answered ratings; apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities; apps/api/tests/features/workflows.test.ts — F-05: corrupted persisted type/denominator data fails closed rather than producing plausible analytics
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-07
Each rating answeredCount includes only its own persisted valid answers; optional omissions add neither zero nor denominator weight.

**Planned STS:** TEST-F05-U01, TEST-F05-I03, TEST-F05-I14
**Actual executed mapping:** apps/api/tests/unit/feedback-rules.test.ts — F-05: exact half-up two-decimal means use only actually answered ratings; apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities; apps/api/tests/features/workflows.test.ts — F-05: corrupted persisted type/denominator data fails closed rather than producing plausible analytics
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-08
Each rating has five ordered integer bins for scores 1–5, zeros included, summing exactly to answeredCount.

**Planned STS:** TEST-F05-U01, TEST-F05-I03, TEST-F05-I14
**Actual executed mapping:** apps/api/tests/unit/feedback-rules.test.ts — F-05: exact half-up two-decimal means use only actually answered ratings; apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities; apps/api/tests/features/workflows.test.ts — F-05: corrupted persisted type/denominator data fails closed rather than producing plausible analytics
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-09
Exact S/N is rounded once with proposed decimal half-up; §5's endpoint/tie/below/above fixtures and two-decimal strings match, without binary-float ambiguity.

**Planned STS:** TEST-F05-U02, TEST-F05-I04, TEST-F05-E01
**Actual executed mapping:** apps/api/tests/unit/feedback-rules.test.ts — F-05: exact half-up two-decimal means use only actually answered ratings; apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities; tests/browser/feedback.spec.ts — B23-01 real owner → student → closed results, persisted reload/relogin and validation [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-10
R=0 and R>0/N=0 produce null means and all-zero bins with distinct no-data messages; never 0.00/NaN or fabricated observations.

**Planned STS:** TEST-F05-U03, TEST-F05-U06, TEST-F05-I05, TEST-F05-E02
**Actual executed mapping:** apps/api/tests/unit/feedback-rules.test.ts — F-05: exact half-up two-decimal means use only actually answered ratings; apps/api/tests/features/workflows.test.ts — INT22-09: inconsistent own participation/bundle fails closed without data, and an empty Closed survey has null results; tests/browser/sprint1-recovery-states.spec.ts — B23-07 real empty contexts and zero results distinguish held loading, delivery error and successful retry [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-11
Frozen IDs/prompts/order/types/required flags/scales/anchors/interpretation are preserved; no live template/current-membership substitution or cross-question comparability claim.

**Planned STS:** TEST-F05-U05, TEST-F05-I06, TEST-F05-E01
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data; apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-12
Closed TEXT comments preserve literal strings, duplicates and line breaks, use deterministic per-question ordering, and carry no identity/bundle/timing or cross-question response linkage.

**Planned STS:** TEST-F05-U05, TEST-F05-I07, TEST-F05-E03
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data; apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-13
Unsafe comments and all user-authored metadata render as literal text; scripts/event handlers/embedded content do not execute.

**Planned STS:** TEST-F05-U06, TEST-F05-E03
**Actual executed mapping:** tests/browser/feedback.spec.ts — B23-01 real owner → student → closed results, persisted reload/relogin and validation [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-14
JSON, DOM, cache/storage, logs and analytics exclude forbidden identity/participation/bundle/timing/auth fields and raw feedback in logs; notice makes no anonymity promise.

**Planned STS:** TEST-F05-U05, TEST-F05-I07, TEST-F05-I09, TEST-F05-E03, TEST-F05-H02
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data; apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-15
Each result response is one committed snapshot across state/count/definitions/answers, including submit and Close races; no mixed Published/Closed projections.

**Planned STS:** TEST-F05-I10, TEST-F05-I11, TEST-F05-H01
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-16
Known storage outage 503 and unexpected/inconsistent data 500 return safe failures, not partial/zero results; Retry performs a safe new read.

**Planned STS:** TEST-F05-I12, TEST-F05-I14, TEST-F05-E04
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — F-05: corrupted persisted type/denominator data fails closed rather than producing plausible analytics
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-17
Repeated reads and restart against unchanged PostgreSQL preserve results/metadata/comment order and all stored rows; GET has no domain writes.

**Planned STS:** TEST-F05-I13, TEST-F05-H01
**Actual executed mapping:** scripts/verify-restart.ts — Actual built API process stop/start with unchanged database/secret, identity/deadline/survey/own answers/results comparison; apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-18
Owner sees correct Published/Closed view, per-question denominator/mean/table, frozen meaning, comments and truthful identified notice at the proposed navigation handoff.

**Planned STS:** TEST-F05-U06, TEST-F05-E01, TEST-F05-E02, TEST-F05-H01
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities; tests/browser/feedback.spec.ts — B23-01 real owner → student → closed results, persisted reload/relogin and validation [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-19
Loading, network/database errors, session expiry and denials show §8 states; old/private content is cleared and no premature/fabricated numbers displayed.

**Planned STS:** TEST-F05-E04, TEST-F05-H02
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data; apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities; tests/browser/sprint1-recovery-states.spec.ts — B23-07 real empty contexts and zero results distinguish held loading, delivery error and successful retry [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-20
Results navigation/Retry and equivalent numerical table work by keyboard with labels/focus/readable layout at 360px and 1280px.

**Planned STS:** TEST-F05-E04, TEST-F05-M01
**Actual executed mapping:** tests/browser/feedback.spec.ts — B23-01 real owner → student → closed results, persisted reload/relogin and validation [real browser/API/PostgreSQL; selected assertions]; tests/browser/sprint1-recovery-states.spec.ts — B23-07 real empty contexts and zero results distinguish held loading, delivery error and successful retry [real browser/API/PostgreSQL; selected assertions]
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

## AC-F05-21
Own unsupported/anonymous mode is safely rejected with no text/count fallback; no S2 thresholds, export, history or overall instructor score are added.

**Planned STS:** TEST-F05-U04, TEST-F05-I02
**Actual executed mapping:** apps/api/tests/post-release/ac-gaps.test.ts - PR46-I03 / AC-F05-21 / TEST-F05-I02: own ANONYMOUS Published and Closed results reject without count or text fallback [PASS; additional post-release run]
**Result / limitation:** Additional post-release API PASS: PR46-I03 confirms own ANONYMOUS Published and Closed results return exact 409 MODE_NOT_SUPPORTED with no count/text payload or persisted response changes. Identified count-only and Closed comment behavior are also checked. ANONYMOUS exists only in the isolated test fixture, not the production enum; no anonymous feature is enabled and the larger planned STS is not relabelled fully Passed.

## AC-F05-22
Reviewed/versioned precode interfaces/schema/rounding and mapped STS exist before dependent implementation; later acceptance records actual results, meaningful TDD and human review, leaving release/PDF gates separate.

**Planned STS:** TEST-F05-M02, TEST-F05-H01, TEST-F05-H02
**Actual executed mapping:** apps/api/tests/features/workflows.test.ts — INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities; apps/api/tests/features/workflows.test.ts — INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data
**Result / limitation:** Selected mapped assertions PASS on main; complete larger STS subconditions remain Partial under accepted G-04

