# Complete Sprint 1 assertion-audited AC results

Assessed release: sprint-1.1 / b458cb65736029f5c7de55e49c9afd6bc8de702a. All 113 AC and 183 original planned STS cases are retained. Current 219 post-main selected executions passed with 0 failed / 0 skipped. A passing scenario is not exhaustive proof of every wider planned condition.

## Evidence provenance
MAIN = current post-main execution, corrected-main-verification.json. HISTORICAL G04 = the 12 recovered real-PostgreSQL checks on 2961014, with original source and limitations retained; not 12 extra current executions. PROCESS = actual commits/reviews/ancestry, not automated application tests. Original 214 PASS and original additional 3 PASS / 2 FAIL are historical only.

## Current AC dispositions
11 AC have direct Pass for the stated behavior; 96 retain Partial evidence, 5 process/history criteria retain Partial acceptance boundaries, and 1 has the explicitly accepted Minor evidence limitation. Total: 113. AC-F04-22 is now supported by the corrected-main regression, including both lifecycle states and authorization precedence. AC-F05-08 retains the explicitly accepted Minor label/order assertion gap. Other Partial entries identify unproved wider conditions; actual human release review accepted the bounded increment without further actionable findings. No missing assertions are fabricated or changed to Pass.

## AC-F01-01
Bootstrap returns a persisted session-bound token, correct guest/auth projection and no-store; repeated live bootstrap does not renew token/deadline.

**Planned STS:** TEST-F01-I01, TEST-F01-I27
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:74-86 - TEST-F01-I01/I03/I04/I07: bootstrap persists; login regenerates SID/token and returns trusted projection
**Demonstrated:** SID/token rotation, safe user keys, persisted session, repeated bootstrap same token/deadline/no new cookie
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:417-428 - F01-store: persisted and cookie expiry never extend past the exact absolute millisecond deadline
**Demonstrated:** stored expiry exactly absolute deadline before/after real me read
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Full guest projection/header/transport permutations not all asserted here.

## AC-F01-02
Exact login/logout schema and transport/decoded bounds reject malformed, oversized, unsupported or identity-spoofing bodies without authentication writes.

**Planned STS:** TEST-F01-U01, TEST-F01-I06, TEST-F01-I15
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:87-99 - TEST-F01-I05/I15: generic credential errors, exact schemas and body security
**Demonstrated:** wrong/unknown credentials identical 401; extra role 422; missing Origin/CSRF 403; media 415 and 8193-byte body 413
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Exact logout schema and every decoded/password bound not exhaustively exercised.

## AC-F01-03
Each seeded role can log in with exact password and normalized email; /me returns the trusted safe current identity.

**Planned STS:** TEST-F01-I03, TEST-F01-I04, TEST-F01-E01
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:74-86 - TEST-F01-I01/I03/I04/I07: bootstrap persists; login regenerates SID/token and returns trusted projection
**Demonstrated:** SID/token rotation, safe user keys, persisted session, repeated bootstrap same token/deadline/no new cookie
**MAIN source/case:** tests/browser/feedback.spec.ts:66-84 - B23-02 real invalid then keyboard login and one StrictMode bootstrap
**Demonstrated:** real invalid credentials, error focus/cleared password; Enter login trusted OWNER and one bootstrap
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Both roles appear throughout real feature/browser fixtures; exact normalization/password whitespace permutations incomplete.

## AC-F01-04
Unknown email and wrong password return the same 401 body without authenticated session; existing auth is not silently switched/renewed by login.

**Planned STS:** TEST-F01-I05, TEST-F01-I28
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:87-99 - TEST-F01-I05/I15: generic credential errors, exact schemas and body security
**Demonstrated:** wrong/unknown credentials identical 401; extra role 422; missing Origin/CSRF 403; media 415 and 8193-byte body 413
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:220-230 - TEST-F01-I09/I28: trusted role is resolved anew and authenticated login does not switch accounts
**Demonstrated:** authenticated login cannot switch account; changed stored role is resolved on later me
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Generic errors and no account switch proven; all nonrenewal permutations not repeated.

## AC-F01-05
Stored credentials are salted Argon2id; exact nontrimmed password verification succeeds/fails correctly; corruption/errors never grant identity.

**Planned STS:** TEST-F01-U06, TEST-F01-I24, TEST-F01-I26
**MAIN source/case:** apps/api/tests/unit/argon2-compatibility.test.ts:3-8 - loads the native Argon2id package and verifies a synthetic round trip (setup only)
**Demonstrated:** native synthetic Argon2id roundtrip and incorrect-password false; setup compatibility only
**MAIN source/case:** apps/api/tests/foundation/database.test.ts:40-52 - seeds synthetic role/context fixtures twice without changing hashes, IDs or sessions
**Demonstrated:** idempotent seed seven users preserves hashes/IDs/session; stored Argon2id and successful verify
**HISTORICAL G04 source/case:** docs/sprints/sprint-1/g04-supplementary-evidence/original-stdin.mjs - G04-S01 A: corrupt verifier input safely fails without authentication
**Demonstrated:** Corrupt stored PHC input only; arbitrary verifier exceptions and actual post-COMMIT network acknowledgement loss not generated.
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Salt uniqueness and exact nontrimmed-password matrix not independently asserted; corrupt verifier is historical supplementary.

## AC-F01-06
Successful login regenerates SID/token, destroys guest SID and waits for durable save; old token/SID cannot authenticate.

**Planned STS:** TEST-F01-I07, TEST-F01-I13
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:74-86 - TEST-F01-I01/I03/I04/I07: bootstrap persists; login regenerates SID/token and returns trusted projection
**Demonstrated:** SID/token rotation, safe user keys, persisted session, repeated bootstrap same token/deadline/no new cookie
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:100-139 - R40-01 / TEST-F01-I18: an exact-expiry persistence failure cannot leave a login cookie or usable session
**Demonstrated:** real expiry-persistence fault: 503, cleared/no usable cookie, unchanged authenticated session rows, subsequent me denied; recovery
**MAIN source/case:** apps/api/tests/release/g04.test.ts:75-92 - G04-F01: physical loss of authenticated UPSERT acknowledgement suppresses cookie and automatic resave
**Demonstrated:** real authenticated UPSERT acknowledgement loss:503, cookie suppression, no recovered cookie authenticates
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Old SID destruction/token cross-session matrix remains broader than selected checks.

## AC-F01-07
Auth is valid just before eight hours and denied exactly at/after it; reads/touch/save/restart cannot extend cookie/store/server deadline. Invalid/future timestamps fail.

**Planned STS:** TEST-F01-U02, TEST-F01-U07, TEST-F01-I08, TEST-F01-I20
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:417-428 - F01-store: persisted and cookie expiry never extend past the exact absolute millisecond deadline
**Demonstrated:** stored expiry exactly absolute deadline before/after real me read
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:208-219 - TEST-F01-I08/I16/I17: expiry is absolute and logout revokes a replayed cookie
**Demonstrated:** logout revokes replayed cookie, repeated revoked-cookie logout 204; manipulated absolute expiry yields SESSION_EXPIRED
**MAIN source/case:** scripts/verify-restart.ts - Actual built API stop/start against same database and session secret
**Demonstrated:** compares session deadline/current identity, persisted surveyed definition, own answers and results; not every lifecycle fixture
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Also advancing-clock and fractional-deadline tests in main; all invalid timestamp fixtures remain separate unit evidence.

## AC-F01-08
Every protected request resolves trusted User/role; deleted/invalid users lose auth and client identity claims never elevate permission.

**Planned STS:** TEST-F01-I09, TEST-F01-I15
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:220-230 - TEST-F01-I09/I28: trusted role is resolved anew and authenticated login does not switch accounts
**Demonstrated:** authenticated login cannot switch account; changed stored role is resolved on later me
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:87-99 - TEST-F01-I05/I15: generic credential errors, exact schemas and body security
**Demonstrated:** wrong/unknown credentials identical 401; extra role 422; missing Origin/CSRF 403; media 415 and 8193-byte body 413
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Stored role change/spoof rejection demonstrated; deleted/invalid-user matrix not fully established.

## AC-F01-09
Confirmed logout revokes the stored session; cookie replay is unauthorized; repeated/absent-session logout follows the documented token no-op policy.

**Planned STS:** TEST-F01-I16, TEST-F01-I17, TEST-F01-E02
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:208-219 - TEST-F01-I08/I16/I17: expiry is absolute and logout revokes a replayed cookie
**Demonstrated:** logout revokes replayed cookie, repeated revoked-cookie logout 204; manipulated absolute expiry yields SESSION_EXPIRED
**MAIN source/case:** tests/browser/logout-csrf-rotation.spec.ts:98-153 - PR45-CSRF real expiry, native guest-cookie headers, failed logout and deliberate current-token retry
**Demonstrated:** real native guest-cookie rotation, failed logout and explicit fresh-token retry
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Actual revocation/replay/expiry evidence; every absent-session/oldtoken policy branch not exhaustively enumerated.

## AC-F01-10
Login/logout/unsafe routes enforce exact Origin and session-bound CSRF, including cross-session/old-token rejection and the explicit logout-only no-op branch.

**Planned STS:** TEST-F01-U03, TEST-F01-I13, TEST-F01-I14, TEST-F01-I17, TEST-F01-E04
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:87-99 - TEST-F01-I05/I15: generic credential errors, exact schemas and body security
**Demonstrated:** wrong/unknown credentials identical 401; extra role 422; missing Origin/CSRF 403; media 415 and 8193-byte body 413
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:231-240 - TEST-F01-I14/I22: old tokens fail; the eleventh valid-shape login is throttled
**Demonstrated:** old token denied; ten valid-shape bad credentials 401, eleventh 429 and Retry-After
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:438-447 - F-01: unsupported methods, foreign origins and forged cookies fail without authority
**Demonstrated:** logout GET405; null Origin/cross-site403; forgedcookie401; courses HEAD405/Allow GET; results actorquery422
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Selected Origin/CSRF/method failures; every unsafe domain route and cross-session combination not established.

## AC-F01-11
Local HTTP versus HTTPS cookies, clearing and validated proxy/configuration behave as specified; spoofed forwarded headers do not make an insecure caller trusted.

**Planned STS:** TEST-F01-I02, TEST-F01-I25, TEST-F01-M02
**MAIN source/case:** apps/api/tests/unit/config.test.ts:9-9 - requires HTTPS in production
**Demonstrated:** production HTTP configuration is rejected; does not execute HTTPS cookie/proxy deployment
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:74-86 - TEST-F01-I01/I03/I04/I07: bootstrap persists; login regenerates SID/token and returns trusted projection
**Demonstrated:** SID/token rotation, safe user keys, persisted session, repeated bootstrap same token/deadline/no new cookie
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Local HTTP behavior observed; deployed HTTPS cookie, clearing, forwarded-header/proxy profile not executed. Remains Partial.

## AC-F01-12
Guard boundary gives unauthenticated 401, authenticated wrong-role 403 and missing/out-of-scope 404 without private data. Real domain integrations remain explicitly assigned.

**Planned STS:** TEST-F01-U04, TEST-F01-I10, TEST-F01-I11, TEST-F01-I12, TEST-F01-H01, TEST-F01-H02, TEST-F01-H03, TEST-F01-H04
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:245-260 - F-02: owner context is scoped even within a shared Course, and query pagination is strict
**Demonstrated:** two authorized Courses, only owned shared-Course Section, foreign Section 404, malformed pagination 422, respondent 403 and guest 401
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:674-698 - INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data
**Demonstrated:** foreign-owner detail/edit/delete/publish404; respondent management403; missing CSRF403; actor spoof422; cross-student read unavailable; owner cannot own-submission
**MAIN source/case:** tests/browser/sprint1-rejections.spec.ts:49-75 - B23-04 genuine browser sessions reject wrong role, foreign Course owner and guest access
**Demonstrated:** real browser guest/wrong role/foreign owner denied; no client role-selector authority
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Selected real protected routes; full guard matrix retains Partial.

## AC-F01-13
DB/store/verifier failures produce safe failure, never memory fallback or successful login/logout acknowledgement; failed revocation remains disclosed/retryable.

**Planned STS:** TEST-F01-I18, TEST-F01-I26, TEST-F01-E05
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:100-139 - R40-01 / TEST-F01-I18: an exact-expiry persistence failure cannot leave a login cookie or usable session
**Demonstrated:** real expiry-persistence fault: 503, cleared/no usable cookie, unchanged authenticated session rows, subsequent me denied; recovery
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:140-159 - R40-01 / TEST-F01-I18: failed guest persistence clears the cookie and leaves no row
**Demonstrated:** failed guest save: 503, cleared cookie, no additional row and me 401
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:391-403 - F-01: session-store failures return safe 503 and never create a memory fallback
**Demonstrated:** renamed real auth_session table produces safe 503 without internal table name; recovery me200
**MAIN source/case:** apps/api/tests/release/g04.test.ts:75-92 - G04-F01: physical loss of authenticated UPSERT acknowledgement suppresses cookie and automatic resave
**Demonstrated:** real authenticated UPSERT acknowledgement loss:503, cookie suppression, no recovered cookie authenticates
**MAIN source/case:** tests/browser/logout-csrf-rotation.spec.ts:98-153 - PR45-CSRF real expiry, native guest-cookie headers, failed logout and deliberate current-token retry
**Demonstrated:** real native guest-cookie rotation, failed logout and explicit fresh-token retry
**HISTORICAL G04 source/case:** docs/sprints/sprint-1/g04-supplementary-evidence/original-stdin.mjs - G04-S01 A: corrupt verifier input safely fails without authentication
**Demonstrated:** Corrupt stored PHC input only; arbitrary verifier exceptions and actual post-COMMIT network acknowledgement loss not generated.
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Selected real save/read/revocation failures; arbitrary verifier exceptions and all dependency stages not tested.

## AC-F01-14
Auth errors/identity projections/logs/cache behavior expose no credentials, SID, other-user payload or private cached content after session loss.

**Planned STS:** TEST-F01-U05, TEST-F01-I23, TEST-F01-E02, TEST-F01-E03
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:74-86 - TEST-F01-I01/I03/I04/I07: bootstrap persists; login regenerates SID/token and returns trusted projection
**Demonstrated:** SID/token rotation, safe user keys, persisted session, repeated bootstrap same token/deadline/no new cookie
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:87-99 - TEST-F01-I05/I15: generic credential errors, exact schemas and body security
**Demonstrated:** wrong/unknown credentials identical 401; extra role 422; missing Origin/CSRF 403; media 415 and 8193-byte body 413
**MAIN source/case:** apps/api/tests/unit/config.test.ts:10-14 - does not echo secret/connection-string input in configuration errors
**Demonstrated:** malformed config error excludes injected private marker
**MAIN source/case:** tests/browser/sprint1-recovery-states.spec.ts:3-41 - B23-05 real expiry clears unsaved private state and ignores a delayed older read; logout survives reload
**Demonstrated:** real expiry clears private unsaved state, held older read ignored; logout survives reload
**MAIN source/case:** apps/api/tests/release/g04.test.ts:180-191 - G04-F07: exercised pool logger and normal/error routes omit known secret and feedback markers
**Demonstrated:** positive pool-log entry captured; known password/token/cookie/feedback marker omitted from exercised console outputs
**HISTORICAL G04 source/case:** docs/sprints/sprint-1/g04-supplementary-evidence/original-stdin.mjs - G04-S12 E: captured failure diagnostics contain no injected marker or known secrets
**Demonstrated:** console.error/warn spy saw ZERO entries; proves silence for exercised paths, not exhaustive logger-boundary/transport/analytics certification.
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Exact safe projections and exercised logs/private UI loss only; full cache/analytics/log transport audit not run.

## AC-F01-15
Login has usable labelled/keyboard/busy/error/timeout behavior and server-derived role navigation at the specified widths.

**Planned STS:** TEST-F01-E01, TEST-F01-E04, TEST-F01-M01
**MAIN source/case:** tests/browser/feedback.spec.ts:66-84 - B23-02 real invalid then keyboard login and one StrictMode bootstrap
**Demonstrated:** real invalid credentials, error focus/cleared password; Enter login trusted OWNER and one bootstrap
**MAIN source/case:** tests/browser/ui-accessibility-real.spec.ts:22-50 - UI-F01/F02 real Draft rejection retains fields and keyboard reorder persists
**Demonstrated:** keyboard Draft422 retains121chartitle/error focus; reorder persists question IDs; removal focus; narrow/zoom layout
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Keyboard login/error focus/layout exercised; all busy/timeout/navigation permutations incomplete.

## AC-F01-16
Session expiry/logout hides private UI, rechecks before protected re-entry and distinguishes server-revocation failure from success.

**Planned STS:** TEST-F01-E02, TEST-F01-E03, TEST-F01-E05
**MAIN source/case:** tests/browser/sprint1-recovery-states.spec.ts:3-41 - B23-05 real expiry clears unsaved private state and ignores a delayed older read; logout survives reload
**Demonstrated:** real expiry clears private unsaved state, held older read ignored; logout survives reload
**MAIN source/case:** tests/browser/logout-csrf-rotation.spec.ts:98-153 - PR45-CSRF real expiry, native guest-cookie headers, failed logout and deliberate current-token retry
**Demonstrated:** real native guest-cookie rotation, failed logout and explicit fresh-token retry
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real expiry/retry path; no full UI state combination certification.

## AC-F01-17
Reviewed migration/seed and test-DB safeguards reproduce User/session storage; sessions survive restart with unchanged absolute deadline.

**Planned STS:** TEST-F01-I20, TEST-F01-I24, TEST-F01-I25, TEST-F01-M02
**MAIN source/case:** apps/api/tests/foundation/database.test.ts:31-38 - deploys the actual migration history onto an empty database and deploys again without changes
**Demonstrated:** three migrations on empty Postgre SQL; second deploy identical checksums
**MAIN source/case:** apps/api/tests/foundation/database.test.ts:40-52 - seeds synthetic role/context fixtures twice without changing hashes, IDs or sessions
**Demonstrated:** idempotent seed seven users preserves hashes/IDs/session; stored Argon2id and successful verify
**MAIN source/case:** scripts/verify-restart.ts - Actual built API stop/start against same database and session secret
**Demonstrated:** compares session deadline/current identity, persisted surveyed definition, own answers and results; not every lifecycle fixture
**PROCESS source/case:** docs/deliverable-1/release-process-and-contributions.md - Actual preimplementation contracts, RED/GREEN commits, teammate reviews and staging/main ancestry
**Demonstrated:** recorded commits/reviews establish sampled engineering sequence; not every planned STS permutation or unreported human work
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Reviewed setup/migrations and persisted restart demonstrated; independent fresh teammate execution not asserted.

## AC-F01-18
The tenth allowed attempt and eleventh rejected attempt/reset behave under the documented per-process limiter; public distributed limitation is explicit.

**Planned STS:** TEST-F01-I22
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:231-240 - TEST-F01-I14/I22: old tokens fail; the eleventh valid-shape login is throttled
**Demonstrated:** old token denied; ten valid-shape bad credentials 401, eleventh 429 and Retry-After
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Tenth/eleventh boundary demonstrated; limiter reset/time advance not established by this scenario; per-process limit disclosed.

## AC-F01-19
Concurrent session reads do not resurrect a revoked session; logging out one independent session does not revoke another.

**Planned STS:** TEST-F01-I19, TEST-F01-I21
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:429-437 - TEST-F01-I19/I21: reads overlapping logout never resurrect the cookie; independent sessions remain usable
**Demonstrated:** overlapping me/logout cannot authorize replay afterward; second independent session remains valid
**Disposition:** PASS for the stated AC behavior in the cited real execution; no claim beyond the tested fixtures.
**Remaining limit:** Real overlap and independent session asserted; csrf retry is not evidence for concurrent server read snapshot.

## AC-F01-20
Preimplementation contract/test-design versions, reviewed Product DoD, actual test results and substantive teammate integration are linked before F-01 is called Done.

**Planned STS:** TEST-F01-M03
**PROCESS source/case:** docs/deliverable-1/release-process-and-contributions.md - Actual preimplementation contracts, RED/GREEN commits, teammate reviews and staging/main ancestry
**Demonstrated:** recorded commits/reviews establish sampled engineering sequence; not every planned STS permutation or unreported human work
**Disposition:** Process evidence inspected; no automated Pass or exhaustive Done claim.
**Remaining limit:** Process evidence only; pending/missing planned outcomes remain explicit, no blanket feature Done assertion.

## AC-F02-01
Reproducible synthetic hierarchy satisfies required roles/FKs/unique relationships; #16 owns its schema without duplicate auth/domain tables.

**Planned STS:** TEST-F02-I01, TEST-F02-M02
**MAIN source/case:** apps/api/tests/foundation/database.test.ts:31-38 - deploys the actual migration history onto an empty database and deploys again without changes
**Demonstrated:** three migrations on empty Postgre SQL; second deploy identical checksums
**MAIN source/case:** apps/api/tests/foundation/database.test.ts:40-52 - seeds synthetic role/context fixtures twice without changing hashes, IDs or sessions
**Demonstrated:** idempotent seed seven users preserves hashes/IDs/session; stored Argon2id and successful verify
**MAIN source/case:** apps/api/tests/foundation/database.test.ts:62-67 - verifies real FK/unique/CHECK constraints, Unicode bounds, reorder and rollback
**Demonstrated:** executes tests/database/constraints.sql transaction and rollback against real Postgre SQL; relevant constraints only
**MAIN source/case:** apps/api/tests/foundation/database.test.ts:69-77 - generates a typed client that reads native calendar dates and owner relationships
**Demonstrated:** typed query retains lecture calendar date and canonical Section owner relationships
**PROCESS source/case:** docs/deliverable-1/release-process-and-contributions.md - Actual preimplementation contracts, RED/GREEN commits, teammate reviews and staging/main ancestry
**Demonstrated:** recorded commits/reviews establish sampled engineering sequence; not every planned STS permutation or unreported human work
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Foundation fixtures/constraints and canonical owners verified; not every uniqueness invariant inferred from seed alone.

## AC-F02-02
All reads require trusted F-01 identity; owner context routes reject respondents before resource detail; client actor data grants nothing.

**Planned STS:** TEST-F02-I02, TEST-F02-I03
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:245-260 - F-02: owner context is scoped even within a shared Course, and query pagination is strict
**Demonstrated:** two authorized Courses, only owned shared-Course Section, foreign Section 404, malformed pagination 422, respondent 403 and guest 401
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:674-698 - INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data
**Demonstrated:** foreign-owner detail/edit/delete/publish404; respondent management403; missing CSRF403; actor spoof422; cross-student read unavailable; owner cannot own-submission
**MAIN source/case:** tests/browser/sprint1-rejections.spec.ts:49-75 - B23-04 genuine browser sessions reject wrong role, foreign Course owner and guest access
**Demonstrated:** real browser guest/wrong role/foreign owner denied; no client role-selector authority
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Trusted role and selected scoping; all read routes not separately enumerated.

## AC-F02-03
Course list contains exactly Courses having an owned Section, once each, without cross-owner data/counts.

**Planned STS:** TEST-F02-I04
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:245-260 - F-02: owner context is scoped even within a shared Course, and query pagination is strict
**Demonstrated:** two authorized Courses, only owned shared-Course Section, foreign Section 404, malformed pagination 422, respondent 403 and guest 401
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Two owned Courses/shared Course filtering; duplicate owned Sections-per Course fixture not explicitly asserted.

## AC-F02-04
Section list requires owned Course access and returns only own Sections; missing/foreign-only parent is indistinguishable 404.

**Planned STS:** TEST-F02-I05
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:245-260 - F-02: owner context is scoped even within a shared Course, and query pagination is strict
**Demonstrated:** two authorized Courses, only owned shared-Course Section, foreign Section 404, malformed pagination 422, respondent 403 and guest 401
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Onlyown Sections and foreign Sectionlecture404; foreign-only Course indistinguishability not fully established.

## AC-F02-05
Lecture list requires owned Section access, supports empty Sections and exposes only the authorized existing-survey reference.

**Planned STS:** TEST-F02-I06
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:245-260 - F-02: owner context is scoped even within a shared Course, and query pagination is strict
**Demonstrated:** two authorized Courses, only owned shared-Course Section, foreign Section 404, malformed pagination 422, respondent 403 and guest 401
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:531-540 - N4: explicitly empty lecture filter fails validation instead of returning all surveys
**Demonstrated:** empty/space/malformed/duplicate lecture filters422; valid lecture returns exact survey401
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Foreign Section denial and authorized lecture filter established; empty Section/exact existing-survey reference list projection not directly asserted. Partial.

## AC-F02-06
Owner survey list is Section-scoped across all three states; optional lecture selection cannot broaden ownership or reveal another Section's survey.

**Planned STS:** TEST-F02-I07
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:531-540 - N4: explicitly empty lecture filter fails validation instead of returning all surveys
**Demonstrated:** empty/space/malformed/duplicate lecture filters422; valid lecture returns exact survey401
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:782-802 - INT22-11: scoped pagination retains totals/order at default, final and beyond-last pages and rejects malformed bounds
**Demonstrated:** two page sequences descending Lecture sequence, total consistency, no duplicate IDs, beyond-last empty, foreign count isolation and malformed query422
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Exact lecture filter and many Draft survey paging; all three states/Section filter isolation not fully asserted. Partial.

## AC-F02-07
Respondent list includes only own-eligible Published/Closed surveys and never Draft or unrelated context.

**Planned STS:** TEST-F02-I08, TEST-F02-I09
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:245-260 - F-02: owner context is scoped even within a shared Course, and query pagination is strict
**Demonstrated:** two authorized Courses, only owned shared-Course Section, foreign Section 404, malformed pagination 422, respondent 403 and guest 401
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:576-602 - INT22-02: frozen eligibility survives live membership changes and definitions remain immutable
**Demonstrated:** membership-independent discovery/detail/submit; added member404; Published edit/delete409; frozen IDs/interpretation/title persist
**MAIN source/case:** tests/browser/sprint1-rejections.spec.ts:49-75 - B23-04 genuine browser sessions reject wrong role, foreign Course owner and guest access
**Demonstrated:** real browser guest/wrong role/foreign owner denied; no client role-selector authority
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Draft/unrelated hidden and frozen eligible discovery selected; full Published/Closed list combination not established.

## AC-F02-08
Post-publication Membership changes do not add/remove discovery eligibility; only frozen eligibility controls it.

**Planned STS:** TEST-F02-I10
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:576-602 - INT22-02: frozen eligibility survives live membership changes and definitions remain immutable
**Demonstrated:** membership-independent discovery/detail/submit; added member404; Published edit/delete409; frozen IDs/interpretation/title persist
**Disposition:** PASS for the stated AC behavior in the cited real execution; no claim beyond the tested fixtures.
**Remaining limit:** Direct previous/added member list assertions after membership change at INT22-02; prior empty mapping corrected.

## AC-F02-09
Each respondent sees only their persisted submitted boolean; another student's participation never changes it.

**Planned STS:** TEST-F02-I11, TEST-F02-H02
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:603-633 - INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Demonstrated:** per-user false/true submitted; exact ordered own answers; Participation/bundle/answer counts; count-only live view; closed per-question means/bins/null; forbidden identity keys absent
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Two eligible users false/false then true/false directly asserted; unrelated access test removed.

## AC-F02-10
Exact safe projections exclude questions/answers/results/identities/session/private fields; text is plain, owner participation absent.

**Planned STS:** TEST-F02-U02, TEST-F02-I12
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:541-552 - N5: owner and eligible student list projections contain the required survey context
**Demonstrated:** owner/respondent list contains course/section/calendar-date/mode and answers is undefined; not an exhaustive forbidden-key assertion
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** N5 asserts no answers and required context; exhaustive safe-key allowlist/questions/results/owner participation absence not proven. Partial.

## AC-F02-11
Exact query/UUID syntax, duplicate/unknown fields, GET bodies and deferred history filters are rejected safely without domain writes.

**Planned STS:** TEST-F02-U01, TEST-F02-I13
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:531-540 - N4: explicitly empty lecture filter fails validation instead of returning all surveys
**Demonstrated:** empty/space/malformed/duplicate lecture filters422; valid lecture returns exact survey401
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:782-802 - INT22-11: scoped pagination retains totals/order at default, final and beyond-last pages and rejects malformed bounds
**Demonstrated:** two page sequences descending Lecture sequence, total consistency, no duplicate IDs, beyond-last empty, foreign count isolation and malformed query422
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:438-447 - F-01: unsupported methods, foreign origins and forged cookies fail without authority
**Demonstrated:** logout GET405; null Origin/cross-site403; forgedcookie401; courses HEAD405/Allow GET; results actorquery422
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Exact selected query/UUID/unknown/duplicate/method failure; GETbody and all deferred filters not fully tested.

## AC-F02-12
Pagination defaults/bounds and authorized totals are correct; empty/out-of-range pages do not expose another actor's counts.

**Planned STS:** TEST-F02-U03, TEST-F02-I14, TEST-F02-I16
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:782-802 - INT22-11: scoped pagination retains totals/order at default, final and beyond-last pages and rejects malformed bounds
**Demonstrated:** two page sequences descending Lecture sequence, total consistency, no duplicate IDs, beyond-last empty, foreign count isolation and malformed query422
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Survey pages and bounds asserted; all context endpoints/defaults not exhaustively covered.

## AC-F02-13
Stable documented ordering/tiebreakers produce repeatable unchanged-data pages and preserve calendar dates.

**Planned STS:** TEST-F02-I15
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:782-802 - INT22-11: scoped pagination retains totals/order at default, final and beyond-last pages and rejects malformed bounds
**Demonstrated:** two page sequences descending Lecture sequence, total consistency, no duplicate IDs, beyond-last empty, foreign count isolation and malformed query422
**MAIN source/case:** apps/api/tests/foundation/database.test.ts:69-77 - generates a typed client that reads native calendar dates and owner relationships
**Demonstrated:** typed query retains lecture calendar date and canonical Section owner relationships
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:541-552 - N5: owner and eligible student list projections contain the required survey context
**Demonstrated:** owner/respondent list contains course/section/calendar-date/mode and answers is undefined; not an exhaustive forbidden-key assertion
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Lecture sequence order and calendar date proven; unchanged-page repetition/full tie-breaker fixtures not established.

## AC-F02-14
Owner/Respondent empty/loading/availability distinctions and parent-reset/page actions match server data without invented workflow success.

**Planned STS:** TEST-F02-I16, TEST-F02-E01, TEST-F02-E02
**MAIN source/case:** tests/browser/sprint1-recovery-states.spec.ts:80-118 - B23-07 real empty contexts and zero results distinguish held loading, delivery error and successful retry
**Demonstrated:** real empty context/zero results, held loading versus delivery error and explicit successful retry
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real empty/loading/delivery error/retry; full cascading parent/page actions not all covered.

## AC-F02-15
Retry, permission/session-loss and superseded-request behavior never restores unrelated/private stale content or treats failure as empty success.

**Planned STS:** TEST-F02-E03, TEST-F02-E04
**MAIN source/case:** tests/browser/sprint1-recovery-states.spec.ts:3-41 - B23-05 real expiry clears unsaved private state and ignores a delayed older read; logout survives reload
**Demonstrated:** real expiry clears private unsaved state, held older read ignored; logout survives reload
**MAIN source/case:** tests/browser/sprint1-recovery-states.spec.ts:80-118 - B23-07 real empty contexts and zero results distinguish held loading, delivery error and successful retry
**Demonstrated:** real empty context/zero results, held loading versus delivery error and explicit successful retry
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real session loss/stale held read and retry; complete every context supersession matrix not established.

## AC-F02-16
Both list journeys are labelled, keyboard-operable and usable at 360px/1280px with visible focus and wrapped content.

**Planned STS:** TEST-F02-E01, TEST-F02-E02, TEST-F02-M01
**MAIN source/case:** tests/browser/ui-accessibility-real.spec.ts:22-50 - UI-F01/F02 real Draft rejection retains fields and keyboard reorder persists
**Demonstrated:** keyboard Draft422 retains121chartitle/error focus; reorder persists question IDs; removal focus; narrow/zoom layout
**MAIN source/case:** tests/browser/ui-accessibility-real.spec.ts:51-92 - UI-F02/F03 real rejection, retained text, confirmed success focus and Closed results
**Demonstrated:** keyboard requiredrating422/no DBwrites/retained text, linked focus, one201/success focus, Closed mean2.00/literal comment and Backfocus
**MAIN source/case:** tests/browser/feedback.spec.ts:66-84 - B23-02 real invalid then keyboard login and one StrictMode bootstrap
**Demonstrated:** real invalid credentials, error focus/cleared password; Enter login trusted OWNER and one bootstrap
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real keyboard login/list open/Back and layout; entire two list journeys/visible focus at exact360/1280 not fully inspected. Partial.

## AC-F02-17
Reads leave domain data unchanged; one response's count/items/participation use a consistent committed snapshot during publication/submission.

**Planned STS:** TEST-F02-I17, TEST-F02-I18
**HISTORICAL G04 source/case:** docs/sprints/sprint-1/g04-supplementary-evidence/original-stdin.mjs - G04-S07 C: discovery count/items stay consistent across concurrent publication
**Demonstrated:** Publication between actual count and items reads; other participation-change permutations not exhaustively repeated.
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Historical actual publication/count-items barrier; not current rerun or participation flag race. Partial.

## AC-F02-18
Database/auth dependency failure produces the safe defined error, no-store and no private diagnostics, not a fabricated empty collection.

**Planned STS:** TEST-F02-I19, TEST-F02-E04
**MAIN source/case:** tests/browser/sprint1-recovery-states.spec.ts:80-118 - B23-07 real empty contexts and zero results distinguish held loading, delivery error and successful retry
**Demonstrated:** real empty context/zero results, held loading versus delivery error and explicit successful retry
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Browser delivery failure/retry only; actual domain read DBoutage for each discovery endpoint not established. Partial.

## AC-F02-19
Actions derive from current state/own status; target features revalidate stale/ineligible requests; no F-03/F-04 write is implemented in F-02.

**Planned STS:** TEST-F02-U04, TEST-F02-I20, TEST-F02-H01, TEST-F02-H02
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:576-602 - INT22-02: frozen eligibility survives live membership changes and definitions remain immutable
**Demonstrated:** membership-independent discovery/detail/submit; added member404; Published edit/delete409; frozen IDs/interpretation/title persist
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:300-332 - F-04/F-05: concurrent duplicate submits persist exactly one result; privacy projection and close ordering
**Demonstrated:** concurrent same-user POST statuses201/409; own answers/status; Published count-only; close rejects further POST; Closed mean/bins/comment exact and no student ID
**MAIN source/case:** tests/browser/sprint1-rejections.spec.ts:3-47 - B23-03 genuine stale forms reject duplicate and Closed submissions without extra rows
**Demonstrated:** real stale browser duplicate/Closed rejection and unchanged persisted counts
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Discovery submitted flag, revalidation duplicate/Closed/ineligible routes; full action state matrix incomplete.

## AC-F02-20
Accepted contract/STS/DoD, actual setup/test/history and substantive teammate integration are linked before claiming F-02 Done.

**Planned STS:** TEST-F02-M02
**PROCESS source/case:** docs/deliverable-1/release-process-and-contributions.md - Actual preimplementation contracts, RED/GREEN commits, teammate reviews and staging/main ancestry
**Demonstrated:** recorded commits/reviews establish sampled engineering sequence; not every planned STS permutation or unreported human work
**Disposition:** Process evidence inspected; no automated Pass or exhaustive Done claim.
**Remaining limit:** Process/history inspection; no automated APItest substituted for human review.

## AC-F03-01
Creating on an owned empty Lecture returns 201 empty IDENTIFIED Draft revision 1, canonical owner and committed definition retrievable by GET.

**Planned STS:** TEST-F03-I01
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:568-575 - INT22-01: concurrent create produces one Draft and one conflict for the same owned lecture
**Demonstrated:** competing create201/409, one persisted Draft revision1
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:261-288 - F-03: one-survey uniqueness, stable definitions/revisions, foreign owner rejection and publication snapshot
**Demonstrated:** owned create 201, duplicate 409, foreign Lecture 404; save revision2, stale409/no-op unchanged; publish frozen eligibility2, later edit409, safe respondent detail
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** 201 and persisted Draft revision1 demonstrated; exact complete empty initial GET/canonical owner envelope not asserted. Partial.

## AC-F03-02
All six routes enforce §2 server-side; foreign-owner records are 404, Respondent management 403, unauthenticated access 401, with no mutation or private data.

**Planned STS:** TEST-F03-I02, TEST-F03-I23
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:674-698 - INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data
**Demonstrated:** foreign-owner detail/edit/delete/publish404; respondent management403; missing CSRF403; actor spoof422; cross-student read unavailable; owner cannot own-submission
**MAIN source/case:** tests/browser/sprint1-rejections.spec.ts:49-75 - B23-04 genuine browser sessions reject wrong role, foreign Course owner and guest access
**Demonstrated:** real browser guest/wrong role/foreign owner denied; no client role-selector authority
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Selected six-route scoping and real roles; guest/shape precedence exhaustive matrix incomplete.

## AC-F03-03
Concurrent creates for one Lecture yield exactly one Survey; committed winner 201 and conflicting loser 409.

**Planned STS:** TEST-F03-I03
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:568-575 - INT22-01: concurrent create produces one Draft and one conflict for the same owned lecture
**Demonstrated:** competing create201/409, one persisted Draft revision1
**Disposition:** PASS for the stated AC behavior in the cited real execution; no claim beyond the tested fixtures.
**Remaining limit:** Real simultaneous requests assert201/409 and one Draft revision1.

## AC-F03-04
Owner reads own three states; Respondent reads only frozen-eligible Published/Closed, never Draft. Projections, question order and disclosure match §5.2; no participant/answer/owner-identity leak.

**Planned STS:** TEST-F03-U06, TEST-F03-I04, TEST-F03-I24, TEST-F03-E04
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:261-288 - F-03: one-survey uniqueness, stable definitions/revisions, foreign owner rejection and publication snapshot
**Demonstrated:** owned create 201, duplicate 409, foreign Lecture 404; save revision2, stale409/no-op unchanged; publish frozen eligibility2, later edit409, safe respondent detail
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:576-602 - INT22-02: frozen eligibility survives live membership changes and definitions remain immutable
**Demonstrated:** membership-independent discovery/detail/submit; added member404; Published edit/delete409; frozen IDs/interpretation/title persist
**HISTORICAL G04 source/case:** docs/sprints/sprint-1/g04-supplementary-evidence/original-stdin.mjs - G04-S06 C: definition parent/questions remain one snapshot across concurrent edit
**Demonstrated:** Actual Postgre SQL queries with driver-delivery barrier; no query results fabricated.
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Frozen eligible detail, safe respondent revision omission and historical coherent parent/questions read; all forbidden safe keys incomplete.

## AC-F03-05
Save atomically adds/edits/removes/reorders questions with retained stable IDs and contiguous positions; invalid/foreign/duplicate IDs cause 422 and no change.

**Planned STS:** TEST-F03-U05, TEST-F03-I05
**MAIN source/case:** tests/browser/ui-accessibility-real.spec.ts:22-50 - UI-F01/F02 real Draft rejection retains fields and keyboard reorder persists
**Demonstrated:** keyboard Draft422 retains121chartitle/error focus; reorder persists question IDs; removal focus; narrow/zoom layout
**HISTORICAL G04 source/case:** docs/sprints/sprint-1/g04-supplementary-evidence/original-stdin.mjs - G04-S02 B: Draft reorder/remove/add retains IDs and persisted ordering
**Demonstrated:** Reorder/remove/add and retained IDs; not every malformed replacement variant.
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real reorder IDs and historical add/remove/contiguous positions; malformed/foreign/duplicate question IDs not fully established.

## AC-F03-06
Normalization and Unicode limits in §4 accept exact bounds and reject one over; Draft blanks allowed, publication blanks rejected, malformed Unicode/NUL safely rejected.

**Planned STS:** TEST-F03-U01, TEST-F03-I06
**MAIN source/case:** apps/api/tests/unit/feedback-rules.test.ts:9-14 - F-03: Draft permits empty definitions while publication requires meaningful rating scales
**Demonstrated:** blank Draft normalized; publication rejected; revision0 and121-code-point title rejected; not all exact bounds
**MAIN source/case:** tests/browser/ui-accessibility-real.spec.ts:22-50 - UI-F01/F02 real Draft rejection retains fields and keyboard reorder persists
**Demonstrated:** keyboard Draft422 retains121chartitle/error focus; reorder persists question IDs; removal focus; narrow/zoom layout
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Blank Draft and overlimit121title asserted; all exact Unicode prompt, anchor and interpretation bounds not demonstrated.

## AC-F03-07
RATING/TEXT and required booleans follow §4; 1–5 scale fixed, labels/interpretation preserved; malformed scales, coercions and unsupported types return 422.

**Planned STS:** TEST-F03-U02, TEST-F03-I07
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:261-288 - F-03: one-survey uniqueness, stable definitions/revisions, foreign owner rejection and publication snapshot
**Demonstrated:** owned create 201, duplicate 409, foreign Lecture 404; save revision2, stale409/no-op unchanged; publish frozen eligibility2, later edit409, safe respondent detail
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Valid RATING/TEXT definitions accepted; malformed scales/boolean coercion/unsupported type matrix not directly established. Partial.

## AC-F03-08
Save accepts 0–10 questions; publication rejects 0/text-only, accepts valid 1 or 10 with RATING, and rejects 11. No failed publication creates eligibility/state changes.

**Planned STS:** TEST-F03-U03, TEST-F03-I08
**MAIN source/case:** apps/api/tests/unit/feedback-rules.test.ts:9-14 - F-03: Draft permits empty definitions while publication requires meaningful rating scales
**Demonstrated:** blank Draft normalized; publication rejected; revision0 and121-code-point title rejected; not all exact bounds
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:514-530 - R3: invalid and empty membership snapshots leave the Draft and eligibility unchanged
**Demonstrated:** invalid/empty membership rejects422, remains Draft/published Atnull/zero eligibility
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Empty definition invalid publication and successful real rating publication; 0/1/10/11 questions/text-only boundary matrix not directly established. Partial.

## AC-F03-09
Real change increments once; normalized no-op with current revision does not. Stale writes conflict; concurrent real saves with same revision have one winner and no lost update.

**Planned STS:** TEST-F03-U04, TEST-F03-I09
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:261-288 - F-03: one-survey uniqueness, stable definitions/revisions, foreign owner rejection and publication snapshot
**Demonstrated:** owned create 201, duplicate 409, foreign Lecture 404; save revision2, stale409/no-op unchanged; publish frozen eligibility2, later edit409, safe respondent detail
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:448-468 - F-03: concurrent Draft edit and publication commit only a consistent frozen revision
**Demonstrated:** edit/publish concurrent one200/one409 and only complete Draft or Published definition
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:761-781 - INT22-10: held-row barriers exercise both Draft save/publication orders with complete frozen revisions
**Demonstrated:** held-row barriers explicitly exercise both edit/publish orders, exact conflict code, complete revision and eligibility count
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real change/no-op/stale and both edit/publish orders; concurrent two real saves at same revision not directly established. Partial.

## AC-F03-10
Matching-revision Draft delete returns 204 and removes only its definition; stale delete 409, absent 404, Published/Closed 409; Lecture can receive a new Draft afterward.

**Planned STS:** TEST-F03-I10
**HISTORICAL G04 source/case:** docs/sprints/sprint-1/g04-supplementary-evidence/original-stdin.mjs - G04-S05 B: delete rollback, valid cascade deletion and same-Lecture recreation
**Demonstrated:** AFTER DELETE failure and successful cascade/recreation; not every connection failure stage.
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Historical real failed deletion rollback, valid cascade and same-Lecture recreation; stale/Published/Closed delete full matrix incomplete.

## AC-F03-11
Only DRAFT→PUBLISHED→CLOSED is allowed. Published/Closed definitions, modes and eligibility cannot be edited/deleted/reopened; invalid transitions are 409 for valid-shaped requests.

**Planned STS:** TEST-F03-U04, TEST-F03-I11, TEST-F03-E04
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:576-602 - INT22-02: frozen eligibility survives live membership changes and definitions remain immutable
**Demonstrated:** membership-independent discovery/detail/submit; added member404; Published edit/delete409; frozen IDs/interpretation/title persist
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:761-781 - INT22-10: held-row barriers exercise both Draft save/publication orders with complete frozen revisions
**Demonstrated:** held-row barriers explicitly exercise both edit/publish orders, exact conflict code, complete revision and eligibility count
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:300-332 - F-04/F-05: concurrent duplicate submits persist exactly one result; privacy projection and close ordering
**Demonstrated:** concurrent same-user POST statuses201/409; own answers/status; Published count-only; close rejects further POST; Closed mean/bins/comment exact and no student ID
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Published edit/delete409 and legal publish/close demonstrated; every reopen/mode/Closed mutation denied permutation not established.

## AC-F03-12
Valid publication commits full frozen definition and exactly the selected eligible snapshot together; no partial state visible.

**Planned STS:** TEST-F03-I12, TEST-F03-H01
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:261-288 - F-03: one-survey uniqueness, stable definitions/revisions, foreign owner rejection and publication snapshot
**Demonstrated:** owned create 201, duplicate 409, foreign Lecture 404; save revision2, stale409/no-op unchanged; publish frozen eligibility2, later edit409, safe respondent detail
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:476-513 - R3: publication validates and freezes one membership snapshot while membership changes concurrently
**Demonstrated:** real lock barrier proves publication uses committed membership snapshot; later membership changes excluded
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:761-781 - INT22-10: held-row barriers exercise both Draft save/publication orders with complete frozen revisions
**Demonstrated:** held-row barriers explicitly exercise both edit/publish orders, exact conflict code, complete revision and eligibility count
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Committed eligibility count/snapshot and edit/publish atomic outcomes; full publication fault stage coverage incomplete.

## AC-F03-13
Empty eligibility or invalid member roles prevent publication with 422 and unchanged Draft/zero snapshot rows.

**Planned STS:** TEST-F03-U03, TEST-F03-I13
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:514-530 - R3: invalid and empty membership snapshots leave the Draft and eligibility unchanged
**Demonstrated:** invalid/empty membership rejects422, remains Draft/published Atnull/zero eligibility
**Disposition:** PASS for the stated AC behavior in the cited real execution; no claim beyond the tested fixtures.
**Remaining limit:** Real invalid/empty member fixtures produce422/unchanged Draft/zero eligibility.

## AC-F03-14
After publication, membership changes do not alter frozen access; required/type/scale/order/mode stay fixed and identified disclosure remains truthful for F-04/F-05.

**Planned STS:** TEST-F03-U06, TEST-F03-I11, TEST-F03-I14, TEST-F03-H03
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:576-602 - INT22-02: frozen eligibility survives live membership changes and definitions remain immutable
**Demonstrated:** membership-independent discovery/detail/submit; added member404; Published edit/delete409; frozen IDs/interpretation/title persist
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:603-633 - INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Demonstrated:** per-user false/true submitted; exact ordered own answers; Participation/bundle/answer counts; count-only live view; closed per-question means/bins/null; forbidden identity keys absent
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Frozen eligibility/access, interpretation and title retained; every question field through all consumers not completely compared.

## AC-F03-15
Controlled edit/publish races produce exactly §7's two outcomes: save-first revision conflict or publish-first invalid-state rejection, never mixed published content.

**Planned STS:** TEST-F03-I15
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:761-781 - INT22-10: held-row barriers exercise both Draft save/publication orders with complete frozen revisions
**Demonstrated:** held-row barriers explicitly exercise both edit/publish orders, exact conflict code, complete revision and eligibility count
**Disposition:** PASS for the stated AC behavior in the cited real execution; no claim beyond the tested fixtures.
**Remaining limit:** Both real held-row orders, exact409codes and full revision/eligibility outcomes.

## AC-F03-16
Controlled membership/publish tests prove the one-statement snapshot boundary before/after committed changes, including invisible uncommitted changes.

**Planned STS:** TEST-F03-I16
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:476-513 - R3: publication validates and freezes one membership snapshot while membership changes concurrently
**Demonstrated:** real lock barrier proves publication uses committed membership snapshot; later membership changes excluded
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Actual one-statement snapshot with concurrent member write; supplementary permutations not all rerun.

## AC-F03-17
Authorized Close changes Published to Closed once, retains publishedAt/revision and all questions/eligibility/responses, and sets closedAt only on success.

**Planned STS:** TEST-F03-I17, TEST-F03-H03
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:300-332 - F-04/F-05: concurrent duplicate submits persist exactly one result; privacy projection and close ordering
**Demonstrated:** concurrent same-user POST statuses201/409; own answers/status; Published count-only; close rejects further POST; Closed mean/bins/comment exact and no student ID
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Close200 and later Closed results/rejection establish transition; all before/after timestamps/revision/eligibility byte comparisons not directly established. Partial.

## AC-F03-18
Sequential and concurrent duplicate publish/close produce one successful transition and subsequent 409, without timestamp/snapshot duplication or rewriting. Concurrent publish/close from Draft follows §7: close-first 409 then Published; publish-first permits subsequent Closed.

**Planned STS:** TEST-F03-U04, TEST-F03-I18
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:300-332 - F-04/F-05: concurrent duplicate submits persist exactly one result; privacy projection and close ordering
**Demonstrated:** concurrent same-user POST statuses201/409; own answers/status; Published count-only; close rejects further POST; Closed mean/bins/comment exact and no student ID
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Sequential close and later reject shown; concurrent duplicate publish/close and both Draft publish/close orders not directly established. Partial.

## AC-F03-19
Close/submit follows BR-11's lock/commit order; close-first rejects submission without rows, submit-first response survives closing. A protocol harness alone is not actual F-04 integration evidence.

**Planned STS:** TEST-F03-I19, TEST-F03-H02
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:366-390 - F-03/F-04: actual API close and submit serialize correctly in both lock orders
**Demonstrated:** held real Survey row establishes both Close/Submit lock orders and expected committed Participation count
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Actual API locks prove both Close/Submit commit orders and expected rows.

## AC-F03-20
Injected write/known precommit failures leave no partial definition/order/snapshot/state changes; safe error, no success. Unknown commit outcome triggers reconciliation, not a fabricated rollback claim.

**Planned STS:** TEST-F03-I20
**MAIN source/case:** apps/api/tests/release/g04.test.ts:94-104 - G04-F02: create failure after actual Survey insertion rolls back and permits same-Lecture creation
**Demonstrated:** AFTER Survey INSERT fault safe 500 and rollback; same Lecture create later201
**MAIN source/case:** apps/api/tests/release/g04.test.ts:106-116 - G04-F03: physical loss after Draft COMMIT is reconciled by persisted definition without replay
**Demonstrated:** real network loss after Draft COMMIT: failure with committed complete revision, persisted-read reconciliation, no replay
**HISTORICAL G04 source/case:** docs/sprints/sprint-1/g04-supplementary-evidence/original-stdin.mjs - G04-S03 B: replacement failure rolls back deletes, staged positions and revision
**Demonstrated:** Question INSERT fault after delete/position staging; not every SQL or COMMIT failure stage.
**HISTORICAL G04 source/case:** docs/sprints/sprint-1/g04-supplementary-evidence/original-stdin.mjs - G04-S04 B: publication failure rolls back inserted eligibility and lifecycle
**Demonstrated:** State-update fault after eligibility insertion; not every publication statement fault.
**HISTORICAL G04 source/case:** docs/sprints/sprint-1/g04-supplementary-evidence/original-stdin.mjs - G04-S05 B: delete rollback, valid cascade deletion and same-Lecture recreation
**Demonstrated:** AFTER DELETE failure and successful cascade/recreation; not every connection failure stage.
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Actual create/precommit fault/post-commit acknowledgement loss and historical replacement/publication/deletion faults; every SQL failure stage not covered.

## AC-F03-21
Shared session/Origin/CSRF/access, route body ceilings, strict JSON/error precedence, safe logs and no-store responses follow §5; spoofed actor/mode cannot bypass checks.

**Planned STS:** TEST-F03-I21, TEST-F03-I23
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:674-698 - INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data
**Demonstrated:** foreign-owner detail/edit/delete/publish404; respondent management403; missing CSRF403; actor spoof422; cross-student read unavailable; owner cannot own-submission
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:438-447 - F-01: unsupported methods, foreign origins and forged cookies fail without authority
**Demonstrated:** logout GET405; null Origin/cross-site403; forgedcookie401; courses HEAD405/Allow GET; results actorquery422
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Role/actor/method/CSRF selected cases only; body ceilings/strict Unicode/error precedence for every management route not fully established. Partial.

## AC-F03-22
Owner completes real create/save/publish and Published/Closed read-only navigation with persisted state confirmation, no premature success.

**Planned STS:** TEST-F03-E01, TEST-F03-E04
**MAIN source/case:** tests/browser/feedback.spec.ts:3-64 - B23-01 real owner → student → closed results, persisted reload/relogin and validation
**Demonstrated:** real UI owner create/publish; student required rejection and keyboard rating; persist/reload/relogin; count-only Published, Closed means/bins/literal script text and real row counts
**MAIN source/case:** tests/browser/ui-accessibility-real.spec.ts:22-50 - UI-F01/F02 real Draft rejection retains fields and keyboard reorder persists
**Demonstrated:** keyboard Draft422 retains121chartitle/error focus; reorder persists question IDs; removal focus; narrow/zoom layout
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real owner journey and persisted revision; all Closed read-only control permutations not separately asserted.

## AC-F03-23
Validation, state/revision conflicts and network uncertainty show §8 recovery without automatic overwrite or false success; recoverable unsaved content retained, session loss clears private state.

**Planned STS:** TEST-F03-E02, TEST-F03-E03
**MAIN source/case:** tests/browser/ui-accessibility-real.spec.ts:22-50 - UI-F01/F02 real Draft rejection retains fields and keyboard reorder persists
**Demonstrated:** keyboard Draft422 retains121chartitle/error focus; reorder persists question IDs; removal focus; narrow/zoom layout
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real validation retention/focus. Broader revision/network reconciliation uses separately labelled mocked HTTP browser scenarios; not inferred as real API evidence.

## AC-F03-24
Core authoring/publication/closing controls are labelled, keyboard usable, focus/error handling visible at 360px and 1280px.

**Planned STS:** TEST-F03-E05, TEST-F03-M01
**MAIN source/case:** tests/browser/ui-accessibility-real.spec.ts:22-50 - UI-F01/F02 real Draft rejection retains fields and keyboard reorder persists
**Demonstrated:** keyboard Draft422 retains121chartitle/error focus; reorder persists question IDs; removal focus; narrow/zoom layout
**MAIN source/case:** tests/browser/ui-accessibility-real.spec.ts:51-92 - UI-F02/F03 real rejection, retained text, confirmed success focus and Closed results
**Demonstrated:** keyboard requiredrating422/no DBwrites/retained text, linked focus, one201/success focus, Closed mean2.00/literal comment and Backfocus
**MAIN source/case:** tests/browser/feedback.spec.ts:3-64 - B23-01 real owner → student → closed results, persisted reload/relogin and validation
**Demonstrated:** real UI owner create/publish; student required rejection and keyboard rating; persist/reload/relogin; count-only Published, Closed means/bins/literal script text and real row counts
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real keyboard/reorder/errors/close and narrow/zoom layout; assistive technology and entire workflow focus not certified.

## AC-F03-25
After process restart against the same PostgreSQL database, committed Draft/Published/Closed definitions, IDs/order/revisions/timestamps and snapshots remain unchanged.

**Planned STS:** TEST-F03-I22
**MAIN source/case:** scripts/verify-restart.ts - Actual built API stop/start against same database and session secret
**Demonstrated:** compares session deadline/current identity, persisted surveyed definition, own answers and results; not every lifecycle fixture
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Actual same DB built-process restart on selected persisted survey; not all three lifecycle fixtures exhaustively compared.

## AC-F03-26
Before implementation, reviewed contract/schema/security/handoff agreements exist; later acceptance has actual mapped unit/API/PostgreSQL/E2E/handoff results, meaningful RED/GREEN and human review, with pending work explicit.

**Planned STS:** TEST-F03-M02, TEST-F03-H01, TEST-F03-H02, TEST-F03-H03
**PROCESS source/case:** docs/deliverable-1/release-process-and-contributions.md - Actual preimplementation contracts, RED/GREEN commits, teammate reviews and staging/main ancestry
**Demonstrated:** recorded commits/reviews establish sampled engineering sequence; not every planned STS permutation or unreported human work
**Disposition:** Process evidence inspected; no automated Pass or exhaustive Done claim.
**Remaining limit:** Actual history/version/review/REDGREEN; missing verification and newdefect remain disclosed, not full Done.

## AC-F04-01
Eligible Published identified survey renders F-03 frozen definitions/disclosure and current own status, without creating another definition API.

**Planned STS:** TEST-F04-E01, TEST-F04-H01
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:261-288 - F-03: one-survey uniqueness, stable definitions/revisions, foreign owner rejection and publication snapshot
**Demonstrated:** owned create 201, duplicate 409, foreign Lecture 404; save revision2, stale409/no-op unchanged; publish frozen eligibility2, later edit409, safe respondent detail
**MAIN source/case:** tests/browser/feedback.spec.ts:3-64 - B23-01 real owner → student → closed results, persisted reload/relogin and validation
**Demonstrated:** real UI owner create/publish; student required rejection and keyboard rating; persist/reload/relogin; count-only Published, Closed means/bins/literal script text and real row counts
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real eligible Published identified disclosure/frozen definition and own readback; full metadata allowlist not asserted.

## AC-F04-02
Required/optional ratings are strict integers 1-5, with no default/coercion/optional zero; missing required rejects.

**Planned STS:** TEST-F04-U01, TEST-F04-I02, TEST-F04-I03, TEST-F04-E02
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:289-299 - F-04: required/type/Unicode/association boundaries reject without any partial response
**Demonstrated:** invalid required/type/association inputs 422 and zero Participation; ineligible404 and Draft hidden
**MAIN source/case:** tests/browser/feedback.spec.ts:3-64 - B23-01 real owner → student → closed results, persisted reload/relogin and validation
**Demonstrated:** real UI owner create/publish; student required rejection and keyboard rating; persist/reload/relogin; count-only Published, Closed means/bins/literal script text and real row counts
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Selected required/type/integer failures and no default UI selection; full score/coercion/optional boundary matrix not all asserted.

## AC-F04-03
Text preserves valid nonblank content, enforces code-point/blank/NUL/surrogate rules and normalizes bounded optional blank to absence.

**Planned STS:** TEST-F04-U02, TEST-F04-I04, TEST-F04-E02
**MAIN source/case:** apps/api/tests/unit/feedback-rules.test.ts:4-8 - F-04: accepts 2000 Unicode code points, preserves nonblank text, rejects 2001 and malformed Unicode
**Demonstrated:** parse Answers exact2000/2001codepoints, blank/NUL/surrogate and literal spaces
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:653-673 - INT22-05: real UTF-8 and surrogate-escaped text enforce code-point boundaries before persistence
**Demonstrated:** UTF8/escaped malformed or over-limit text rejected; exact2000-codepoint text including leading spaces/newline preserved in own readback
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real API UTF8/escaped exact2000boundaries, malformed Unicode and literal newline retention; optional blank omission in INT22-03.

## AC-F04-04
Unknown/duplicate/wrong-survey IDs, wrong type and empty normalized response reject without partial persistence.

**Planned STS:** TEST-F04-U03, TEST-F04-U05, TEST-F04-I05, TEST-F04-I06
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:289-299 - F-04: required/type/Unicode/association boundaries reject without any partial response
**Demonstrated:** invalid required/type/association inputs 422 and zero Participation; ineligible404 and Draft hidden
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Selected invalid association/type arrays reject with zero Participation; complete every unknown/duplicate fixture matrix not presumed.

## AC-F04-05
256 KiB byte/compression/parser and decoded limits are independent; supported UTF-8/escaped maximum fits and oversized request writes nothing.

**Planned STS:** TEST-F04-I07
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:699-729 - INT22-07: exact chunked transport ceiling is accepted; oversized, compressed and malformed bodies never write
**Demonstrated:** actual chunked body exactly at the limit accepted; oversized/compressed/malformed bodies rejected with no response writes
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real exact transport/oversize/compression/parser cases; exhaustive all question maximum payload shapes not covered.

## AC-F04-06
Actor is server-resolved; guest/wrong-role/spoofed identity cannot submit/read for another account.

**Planned STS:** TEST-F04-I08, TEST-F04-I17
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:674-698 - INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data
**Demonstrated:** foreign-owner detail/edit/delete/publish404; respondent management403; missing CSRF403; actor spoof422; cross-student read unavailable; owner cannot own-submission
**MAIN source/case:** tests/browser/sprint1-rejections.spec.ts:49-75 - B23-04 genuine browser sessions reject wrong role, foreign Course owner and guest access
**Demonstrated:** real browser guest/wrong role/foreign owner denied; no client role-selector authority
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Trusted actor, wrong role and private own routes proven; every spoof syntax permutation not enumerated.

## AC-F04-07
Frozen eligibility controls both endpoints despite later Membership changes; Draft/ineligible/missing remains hidden.

**Planned STS:** TEST-F04-I09
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:576-602 - INT22-02: frozen eligibility survives live membership changes and definitions remain immutable
**Demonstrated:** membership-independent discovery/detail/submit; added member404; Published edit/delete409; frozen IDs/interpretation/title persist
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:289-299 - F-04: required/type/Unicode/association boundaries reject without any partial response
**Demonstrated:** invalid required/type/association inputs 422 and zero Participation; ineligible404 and Draft hidden
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Frozen previous member submit201/newmember404, Draft hidden; every endpoint permutation not exhaustive.

## AC-F04-08
Closed/non-Published requests never create a response; documented state/duplicate precedence holds.

**Planned STS:** TEST-F04-I10, TEST-F04-I11
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:300-332 - F-04/F-05: concurrent duplicate submits persist exactly one result; privacy projection and close ordering
**Demonstrated:** concurrent same-user POST statuses201/409; own answers/status; Published count-only; close rejects further POST; Closed mean/bins/comment exact and no student ID
**MAIN source/case:** tests/browser/sprint1-rejections.spec.ts:3-47 - B23-03 genuine stale forms reject duplicate and Closed submissions without extra rows
**Demonstrated:** real stale browser duplicate/Closed rejection and unchanged persisted counts
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Published-only/Closed409 and stale duplicate real browser; explicit all-error precedence permutations remain Partial.

## AC-F04-09
Valid POST commits one Participation/bundle/all normalized typed answers and returns only persisted own data in question-position order.

**Planned STS:** TEST-F04-U06, TEST-F04-I01
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:603-633 - INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Demonstrated:** per-user false/true submitted; exact ordered own answers; Participation/bundle/answer counts; count-only live view; closed per-question means/bins/null; forbidden identity keys absent
**MAIN source/case:** tests/browser/ui-accessibility-real.spec.ts:51-92 - UI-F02/F03 real rejection, retained text, confirmed success focus and Closed results
**Demonstrated:** keyboard requiredrating422/no DBwrites/retained text, linked focus, one201/success focus, Closed mean2.00/literal comment and Backfocus
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Persisted ordered answers, all row counts, one201; every typed-row column compared by separate constraints tests only.

## AC-F04-10
Sequential repeat returns duplicate conflict without second/changed response.

**Planned STS:** TEST-F04-I11
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:603-633 - INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Demonstrated:** per-user false/true submitted; exact ordered own answers; Participation/bundle/answer counts; count-only live view; closed per-question means/bins/null; forbidden identity keys absent
**MAIN source/case:** tests/browser/sprint1-rejections.spec.ts:3-47 - B23-03 genuine stale forms reject duplicate and Closed submissions without extra rows
**Demonstrated:** real stale browser duplicate/Closed rejection and unchanged persisted counts
**Disposition:** PASS for the stated AC behavior in the cited real execution; no claim beyond the tested fixtures.
**Remaining limit:** Sequentialrepeat409 and unchanged Participation/bundle/answer counts.

## AC-F04-11
Concurrent same-student submit produces exactly one success/committed bundle; loser safely rejected.

**Planned STS:** TEST-F04-I12
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:300-332 - F-04/F-05: concurrent duplicate submits persist exactly one result; privacy projection and close ordering
**Demonstrated:** concurrent same-user POST statuses201/409; own answers/status; Published count-only; close rejects further POST; Closed mean/bins/comment exact and no student ID
**Disposition:** PASS for the stated AC behavior in the cited real execution; no claim beyond the tested fixtures.
**Remaining limit:** Concurrent two POST statuses201/409 and exact one own persisted response.

## AC-F04-12
Invalid item or forced failure at each write phase leaves no partial rows or success confirmation.

**Planned STS:** TEST-F04-I02, TEST-F04-I13
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:634-652 - INT22-04: faults after each response write stage roll back all rows and permit one valid retry
**Demonstrated:** AFTER INSERT faults independently at Participation/Bundle/Answer rollback all rows, safe 500, one deliberate retry succeeds
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Three actual write-stage faults roll back all response rows; every SQL statement/commit outcome remains separate.

## AC-F04-13
Real Survey lock order determines close-first rejection versus submit-first inclusion; no timestamp/arrival shortcut.

**Planned STS:** TEST-F04-I14, TEST-F04-I15, TEST-F04-H01
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:366-390 - F-03/F-04: actual API close and submit serialize correctly in both lock orders
**Demonstrated:** held real Survey row establishes both Close/Submit lock orders and expected committed Participation count
**Disposition:** PASS for the stated AC behavior in the cited real execution; no claim beyond the tested fixtures.
**Remaining limit:** Actual Survey lock orders and persisted Participation counts.

## AC-F04-14
Frozen definitions/required flags/scale are consumed without update; no response edit/delete/reopen operation exists.

**Planned STS:** TEST-F04-I18, TEST-F04-H01
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:576-602 - INT22-02: frozen eligibility survives live membership changes and definitions remain immutable
**Demonstrated:** membership-independent discovery/detail/submit; added member404; Published edit/delete409; frozen IDs/interpretation/title persist
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Published definition edit/delete rejected; response routes consume unchanged definitions. Full before/after definition snapshot and all unknown mutation methods not directly tested.

## AC-F04-15
Own false/true status and persisted identified answers survive closure/logout-login/restart; consistent read does not fabricate integrity recovery.

**Planned STS:** TEST-F04-I16, TEST-F04-E01
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:745-760 - INT22-09: inconsistent own participation/bundle fails closed without data, and an empty Closed survey has null results
**Demonstrated:** inconsistent participation/bundle safe 500/no identity; zero-response Closed mean null and fivezero bins
**MAIN source/case:** scripts/verify-restart.ts - Actual built API stop/start against same database and session secret
**Demonstrated:** compares session deadline/current identity, persisted surveyed definition, own answers and results; not every lifecycle fixture
**MAIN source/case:** tests/browser/feedback.spec.ts:3-64 - B23-01 real owner → student → closed results, persisted reload/relogin and validation
**Demonstrated:** real UI owner create/publish; student required rejection and keyboard rating; persist/reload/relogin; count-only Published, Closed means/bins/literal script text and real row counts
**MAIN source/case:** tests/browser/sprint1-rejections.spec.ts:3-47 - B23-03 genuine stale forms reject duplicate and Closed submissions without extra rows
**Demonstrated:** real stale browser duplicate/Closed rejection and unchanged persisted counts
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real own readback/reload/relogin/closure/restart and inconsistent-data fail-closed behavior; all concurrent-read permutations incomplete.

## AC-F04-16
Other-student lookup, forged query/body identity and owner respondent-linked access are denied without leakage.

**Planned STS:** TEST-F04-I17, TEST-F04-I21
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:674-698 - INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data
**Demonstrated:** foreign-owner detail/edit/delete/publish404; respondent management403; missing CSRF403; actor spoof422; cross-student read unavailable; owner cannot own-submission
**MAIN source/case:** tests/browser/sprint1-rejections.spec.ts:49-75 - B23-04 genuine browser sessions reject wrong role, foreign Course owner and guest access
**Demonstrated:** real browser guest/wrong role/foreign owner denied; no client role-selector authority
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Cross-actor query/schema/wrong role/foreign ownership tested; full identifier enumeration matrix incomplete.

## AC-F04-17
UI pending/confirmation/readonly states reflect real API outcomes; no duplicate UI POST or premature success.

**Planned STS:** TEST-F04-E01, TEST-F04-E02
**MAIN source/case:** tests/browser/feedback.spec.ts:3-64 - B23-01 real owner → student → closed results, persisted reload/relogin and validation
**Demonstrated:** real UI owner create/publish; student required rejection and keyboard rating; persist/reload/relogin; count-only Published, Closed means/bins/literal script text and real row counts
**MAIN source/case:** tests/browser/sprint1-rejections.spec.ts:3-47 - B23-03 genuine stale forms reject duplicate and Closed submissions without extra rows
**Demonstrated:** real stale browser duplicate/Closed rejection and unchanged persisted counts
**MAIN source/case:** tests/browser/sprint1-recovery-states.spec.ts:43-78 - B23-06 real committed POST loses delivery and remains blocked until real persisted reconciliation
**Demonstrated:** real committed POST response delivery lost; UI blocks resend until real persisted ownstatus; one response
**MAIN source/case:** tests/browser/ui-accessibility-real.spec.ts:51-92 - UI-F02/F03 real rejection, retained text, confirmed success focus and Closed results
**Demonstrated:** keyboard requiredrating422/no DBwrites/retained text, linked focus, one201/success focus, Closed mean2.00/literal comment and Backfocus
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real API validation/confirmation, duplicate/Closed and lost delivery reconciliation; all pending double-click timing permutations not certified.

## AC-F04-18
Ambiguous acknowledgement queries own persisted status before deliberate retry; no automatic response resend.

**Planned STS:** TEST-F04-I20, TEST-F04-E03
**MAIN source/case:** tests/browser/sprint1-recovery-states.spec.ts:43-78 - B23-06 real committed POST loses delivery and remains blocked until real persisted reconciliation
**Demonstrated:** real committed POST response delivery lost; UI blocks resend until real persisted ownstatus; one response
**MAIN source/case:** apps/api/tests/release/g04.test.ts:118-129 - G04-F04: physical loss after response COMMIT preserves one response and own-status reconciliation
**Demonstrated:** real network loss after response COMMIT: one committed response, ownstatus reconciliation, deliberate duplicate409
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:730-744 - INT22-08: a real held Survey lock returns safe timeout with zero rows, then a deliberate retry succeeds
**Demonstrated:** actual held Survey lock timesout503/error-only, zero rows, ownfalse; deliberate retry201
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Actual post COMMIT lost response and real own status; held-lock timeout safe rollback; deliberately retried only. No fabricated unconditional rollback claim.

## AC-F04-19
Auth/Origin/CSRF/method/schema/state errors match exact codes/precedence with no database/internal/input exposure.

**Planned STS:** TEST-F04-U04, TEST-F04-I10, TEST-F04-I18, TEST-F04-I20
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:674-698 - INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data
**Demonstrated:** foreign-owner detail/edit/delete/publish404; respondent management403; missing CSRF403; actor spoof422; cross-student read unavailable; owner cannot own-submission
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:730-744 - INT22-08: a real held Survey lock returns safe timeout with zero rows, then a deliberate retry succeeds
**Demonstrated:** actual held Survey lock timesout503/error-only, zero rows, ownfalse; deliberate retry201
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:438-447 - F-01: unsupported methods, foreign origins and forged cookies fail without authority
**Demonstrated:** logout GET405; null Origin/cross-site403; forgedcookie401; courses HEAD405/Allow GET; results actorquery422
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Exact selected role/CSRF/schema/timeout/method errors; every Origin/state precedence permutation incomplete.

## AC-F04-20
Private response data is absent from caches/storage/logs/other-user payloads; expiry/logout removes stale client content.

**Planned STS:** TEST-F04-I21, TEST-F04-E04
**MAIN source/case:** tests/browser/sprint1-recovery-states.spec.ts:3-41 - B23-05 real expiry clears unsaved private state and ignores a delayed older read; logout survives reload
**Demonstrated:** real expiry clears private unsaved state, held older read ignored; logout survives reload
**MAIN source/case:** apps/api/tests/release/g04.test.ts:180-191 - G04-F07: exercised pool logger and normal/error routes omit known secret and feedback markers
**Demonstrated:** positive pool-log entry captured; known password/token/cookie/feedback marker omitted from exercised console outputs
**HISTORICAL G04 source/case:** docs/sprints/sprint-1/g04-supplementary-evidence/original-stdin.mjs - G04-S12 E: captured failure diagnostics contain no injected marker or known secrets
**Demonstrated:** console.error/warn spy saw ZERO entries; proves silence for exercised paths, not exhaustive logger-boundary/transport/analytics certification.
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real private state clearing and exercised logging; full cache/storage/analytics boundary matrix not run.

## AC-F04-21
Reviewed real schema enforces relevant FK/unique/range/typed-column invariants with atomic backend cross-table checks.

**Planned STS:** TEST-F04-I19
**MAIN source/case:** apps/api/tests/foundation/database.test.ts:62-67 - verifies real FK/unique/CHECK constraints, Unicode bounds, reorder and rollback
**Demonstrated:** executes tests/database/constraints.sql transaction and rollback against real Postgre SQL; relevant constraints only
**PROCESS source/case:** docs/deliverable-1/release-process-and-contributions.md - Actual preimplementation contracts, RED/GREEN commits, teammate reviews and staging/main ancestry
**Demonstrated:** recorded commits/reviews establish sampled engineering sequence; not every planned STS permutation or unreported human work
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Reviewed real FK/unique/CHECK and transaction tests; APIcross-table association covered selected cases; not every constraint inferred from schema.

## AC-F04-22
Unsupported mode never stores or reveals an identified/anonymous fallback; no extra student-linked anonymous retrieval.

**Planned STS:** TEST-F04-I10
**MAIN source/case:** apps/api/tests/post-release/ac-gaps.test.ts:74-87 - PR46-I01 / AC-F04-22 / TEST-F04-I10: ANONYMOUS duplicate POST rejects mode before duplicate without writes
**Demonstrated:** Current main PASS: unsupported-mode POST before duplicate, persisted rows unchanged
**MAIN source/case:** apps/api/tests/post-release/ac-gaps.test.ts:121-137 - PR46-I04-%s / AC-F04-22 / TEST-F04-I10: ANONYMOUS own readback rejects without identified-answer fallback
**Demonstrated:** PASS: Published and Closed unsupported-mode own readback409 MODE_NOT_SUPPORTED for eligible submitted and unsubmitted respondents; ineligible404 and owner403 precedence; no answer fallback or persisted-row changes.
**Disposition:** PASS for the supported-mode defensive boundary in the cited corrected-main PostgreSQL executions.
**Remaining limit:** Anonymous Mode itself remains Sprint 2 scope. Synthetic enum extension exists only in the disposable regression database; no production enum/schema change. Original failing observations remain historical and corrected in the current assessed release.

## AC-F04-23
F-02 participation flag and F-05 count/denominator/text projections match actual committed normalized rows.

**Planned STS:** TEST-F04-H02, TEST-F04-H03
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:603-633 - INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Demonstrated:** per-user false/true submitted; exact ordered own answers; Participation/bundle/answer counts; count-only live view; closed per-question means/bins/null; forbidden identity keys absent
**MAIN source/case:** tests/browser/feedback.spec.ts:3-64 - B23-01 real owner → student → closed results, persisted reload/relogin and validation
**Demonstrated:** real UI owner create/publish; student required rejection and keyboard rating; persist/reload/relogin; count-only Published, Closed means/bins/literal script text and real row counts
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Exact per student flag/count/per question denominator/comment projection verified from real committed rows.

## AC-F04-24
Accepted contract/STS/DoD, real meaningful RED/GREEN, mapped outcomes, opposite-member review/integration and limitations precede feature Done.

**Planned STS:** TEST-F04-M02
**PROCESS source/case:** docs/deliverable-1/release-process-and-contributions.md - Actual preimplementation contracts, RED/GREEN commits, teammate reviews and staging/main ancestry
**Demonstrated:** recorded commits/reviews establish sampled engineering sequence; not every planned STS permutation or unreported human work
**Disposition:** Process evidence inspected; no automated Pass or exhaustive Done claim.
**Remaining limit:** Actual versioned contract, sampled REDGREEN/review/integration; no invented human approval for newly found defect.

## AC-F04-25
Core form/readback/errors support labelled keyboard/focus and narrow/wide layouts with truthful identified disclosure.

**Planned STS:** TEST-F04-E01, TEST-F04-E02, TEST-F04-E04, TEST-F04-M01
**MAIN source/case:** tests/browser/feedback.spec.ts:3-64 - B23-01 real owner → student → closed results, persisted reload/relogin and validation
**Demonstrated:** real UI owner create/publish; student required rejection and keyboard rating; persist/reload/relogin; count-only Published, Closed means/bins/literal script text and real row counts
**MAIN source/case:** tests/browser/ui-accessibility-real.spec.ts:51-92 - UI-F02/F03 real rejection, retained text, confirmed success focus and Closed results
**Demonstrated:** keyboard requiredrating422/no DBwrites/retained text, linked focus, one201/success focus, Closed mean2.00/literal comment and Backfocus
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real identified notice/keyboard rating/error focus/narrow/zoom/readback; full screen reader/manual WCAG not run.

## AC-F05-01
Own Draft results GET is 409 RESULTS_NOT_AVAILABLE with no statistics; UI shows unavailable, never invented zeros.

**Planned STS:** TEST-F05-U04, TEST-F05-I02, TEST-F05-E02
**MAIN source/case:** apps/api/tests/post-release/ac-gaps.test.ts:89-102 - PR46-I02 / AC-F05-01 / TEST-F05-I02: own Draft results reject state before mode without statistics or mutation
**Demonstrated:** Current main PASS: Draftresults409/erroronly, mode precedence and no writes
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Additional post-release API Draft409/state before mode proven; UI unavailability not newly verified. Partial.

## AC-F05-02
Own identified Published GET returns exactly survey metadata and committed responseCount, including real zero; no answer/comment query or quantitative payload/DOM.

**Planned STS:** TEST-F05-U04, TEST-F05-I02, TEST-F05-I10, TEST-F05-E02
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:603-633 - INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Demonstrated:** per-user false/true submitted; exact ordered own answers; Participation/bundle/answer counts; count-only live view; closed per-question means/bins/null; forbidden identity keys absent
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:300-332 - F-04/F-05: concurrent duplicate submits persist exactly one result; privacy projection and close ordering
**Demonstrated:** concurrent same-user POST statuses201/409; own answers/status; Published count-only; close rejects further POST; Closed mean/bins/comment exact and no student ID
**MAIN source/case:** tests/browser/feedback.spec.ts:3-64 - B23-01 real owner → student → closed results, persisted reload/relogin and validation
**Demonstrated:** real UI owner create/publish; student required rejection and keyboard rating; persist/reload/relogin; count-only Published, Closed means/bins/literal script text and real row counts
**HISTORICAL G04 source/case:** docs/sprints/sprint-1/g04-supplementary-evidence/original-stdin.mjs - G04-S08 C: Published results keep prior snapshot during concurrent submission
**Demonstrated:** One concurrent second response; uncommitted/other permutations remain covered only where separately evidenced.
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Live count-only exact keys/no UItable and historical concurrent second submit snapshot; no SQL-answer-query spy in this mapping.

## AC-F05-03
Own identified Closed GET returns full ordered frozen question results and identified comments; low counts are not suppressed and stored data is unchanged.

**Planned STS:** TEST-F05-U04, TEST-F05-I02, TEST-F05-I11, TEST-F05-E01
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:603-633 - INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Demonstrated:** per-user false/true submitted; exact ordered own answers; Participation/bundle/answer counts; count-only live view; closed per-question means/bins/null; forbidden identity keys absent
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:300-332 - F-04/F-05: concurrent duplicate submits persist exactly one result; privacy projection and close ordering
**Demonstrated:** concurrent same-user POST statuses201/409; own answers/status; Published count-only; close rejects further POST; Closed mean/bins/comment exact and no student ID
**MAIN source/case:** tests/browser/feedback.spec.ts:3-64 - B23-01 real owner → student → closed results, persisted reload/relogin and validation
**Demonstrated:** real UI owner create/publish; student required rejection and keyboard rating; persist/reload/relogin; count-only Published, Closed means/bins/literal script text and real row counts
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real Closed per-question means/bins/comments andcount; all frozen fields/comment ordering/read side-effect comparisons incomplete.

## AC-F05-04
Unauthenticated 401, Respondent 403, foreign/missing Survey 404, including same Course/different Owner; direct calls and guessed IDs cannot bypass it.

**Planned STS:** TEST-F05-U04, TEST-F05-I01, TEST-F05-I09, TEST-F05-H02
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:674-698 - INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data
**Demonstrated:** foreign-owner detail/edit/delete/publish404; respondent management403; missing CSRF403; actor spoof422; cross-student read unavailable; owner cannot own-submission
**MAIN source/case:** tests/browser/sprint1-rejections.spec.ts:49-75 - B23-04 genuine browser sessions reject wrong role, foreign Course owner and guest access
**Demonstrated:** real browser guest/wrong role/foreign owner denied; no client role-selector authority
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Actual roles/foreign ownership; guest protected access covered context suite, not every results UUID branch.

## AC-F05-05
UUID/body/query/method/Origin and error precedence follow §4.3; safe messages do not reveal private records or echo inputs.

**Planned STS:** TEST-F05-I01, TEST-F05-I08, TEST-F05-I09
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:438-447 - F-01: unsupported methods, foreign origins and forged cookies fail without authority
**Demonstrated:** logout GET405; null Origin/cross-site403; forgedcookie401; courses HEAD405/Allow GET; results actorquery422
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:674-698 - INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data
**Demonstrated:** foreign-owner detail/edit/delete/publish404; respondent management403; missing CSRF403; actor spoof422; cross-student read unavailable; owner cannot own-submission
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Directresultsactorquery422 and selected access errors; UUID/body/method/Origin/error precedence results matrix incomplete. Partial.

## AC-F05-06
responseCount equals committed distinct participating respondents, not eligibility, bundles/answers or current membership; joins cannot multiply it.

**Planned STS:** TEST-F05-U01, TEST-F05-I03, TEST-F05-I10, TEST-F05-I14
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:603-633 - INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Demonstrated:** per-user false/true submitted; exact ordered own answers; Participation/bundle/answer counts; count-only live view; closed per-question means/bins/null; forbidden identity keys absent
**Disposition:** PASS for the stated AC behavior in the cited real execution; no claim beyond the tested fixtures.
**Remaining limit:** Two Participation/two bundles/four answers yields response Count2; not multiplied by joins. Optional omission separately asserted.

## AC-F05-07
Each rating answeredCount includes only its own persisted valid answers; optional omissions add neither zero nor denominator weight.

**Planned STS:** TEST-F05-U01, TEST-F05-I03, TEST-F05-I14
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:603-633 - INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Demonstrated:** per-user false/true submitted; exact ordered own answers; Participation/bundle/answer counts; count-only live view; closed per-question means/bins/null; forbidden identity keys absent
**Disposition:** PASS for the stated AC behavior in the cited real execution; no claim beyond the tested fixtures.
**Remaining limit:** Required N2/optional N1/unanswered N0 verified directly.

## AC-F05-08
Each rating has five ordered integer bins for scores 1–5, zeros included, summing exactly to answeredCount.

**Planned STS:** TEST-F05-U01, TEST-F05-I03, TEST-F05-I14
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:603-633 - INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Demonstrated:** per-user false/true submitted; exact ordered own answers; Participation/bundle/answer counts; count-only live view; closed per-question means/bins/null; forbidden identity keys absent
**Disposition:** Distribution counts PASS; explicit score-label/order assertion is a reviewer-accepted Minor evidence limitation.
**Remaining limit:** Existing tests assert five distribution counts but do not explicitly assert score labels/order [1,2,3,4,5]. R1NNE0 accepted this evidence gap in PR #46 and release PR #48; no implementation defect or fabricated complete assertion is claimed.

## AC-F05-09
Exact S/N is rounded once with proposed decimal half-up; §5's endpoint/tie/below/above fixtures and two-decimal strings match, without binary-float ambiguity.

**Planned STS:** TEST-F05-U02, TEST-F05-I04, TEST-F05-E01
**MAIN source/case:** apps/api/tests/unit/feedback-rules.test.ts:15-18 - F-05: exact half-up two-decimal means use only actually answered ratings
**Demonstrated:** null,3.33,3.67,1.125-to-1.13 and3.00 fixtures; not entire planned rounding matrix
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:603-633 - INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Demonstrated:** per-user false/true submitted; exact ordered own answers; Participation/bundle/answer counts; count-only live view; closed per-question means/bins/null; forbidden identity keys absent
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Direct half-uptie1.125->1.13 plus3.33/3.67; real3.00/5.00; all planned endpoint/tie/below/above fixtures not executed.

## AC-F05-10
R=0 and R>0/N=0 produce null means and all-zero bins with distinct no-data messages; never 0.00/NaN or fabricated observations.

**Planned STS:** TEST-F05-U03, TEST-F05-U06, TEST-F05-I05, TEST-F05-E02
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:745-760 - INT22-09: inconsistent own participation/bundle fails closed without data, and an empty Closed survey has null results
**Demonstrated:** inconsistent participation/bundle safe 500/no identity; zero-response Closed mean null and fivezero bins
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:603-633 - INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Demonstrated:** per-user false/true submitted; exact ordered own answers; Participation/bundle/answer counts; count-only live view; closed per-question means/bins/null; forbidden identity keys absent
**MAIN source/case:** tests/browser/sprint1-recovery-states.spec.ts:80-118 - B23-07 real empty contexts and zero results distinguish held loading, delivery error and successful retry
**Demonstrated:** real empty context/zero results, held loading versus delivery error and explicit successful retry
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** R0/N0null/fivezeros and R2N0null; real zero results UI; all specified message branches not separately asserted.

## AC-F05-11
Frozen IDs/prompts/order/types/required flags/scales/anchors/interpretation are preserved; no live template/current-membership substitution or cross-question comparability claim.

**Planned STS:** TEST-F05-U05, TEST-F05-I06, TEST-F05-E01
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:576-602 - INT22-02: frozen eligibility survives live membership changes and definitions remain immutable
**Demonstrated:** membership-independent discovery/detail/submit; added member404; Published edit/delete409; frozen IDs/interpretation/title persist
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:603-633 - INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Demonstrated:** per-user false/true submitted; exact ordered own answers; Participation/bundle/answer counts; count-only live view; closed per-question means/bins/null; forbidden identity keys absent
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Correct INT22-02immutabledefinition/frozen eligibility and INT22-03originalscaleanchors. Full frozen IDs/prompts/order/types/allflags results snapshot comparison not proven. Partial.

## AC-F05-12
Closed TEXT comments preserve literal strings, duplicates and line breaks, use deterministic per-question ordering, and carry no identity/bundle/timing or cross-question response linkage.

**Planned STS:** TEST-F05-U05, TEST-F05-I07, TEST-F05-E03
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:300-332 - F-04/F-05: concurrent duplicate submits persist exactly one result; privacy projection and close ordering
**Demonstrated:** concurrent same-user POST statuses201/409; own answers/status; Published count-only; close rejects further POST; Closed mean/bins/comment exact and no student ID
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:653-673 - INT22-05: real UTF-8 and surrogate-escaped text enforce code-point boundaries before persistence
**Demonstrated:** UTF8/escaped malformed or over-limit text rejected; exact2000-codepoint text including leading spaces/newline preserved in own readback
**MAIN source/case:** tests/browser/feedback.spec.ts:3-64 - B23-01 real owner → student → closed results, persisted reload/relogin and validation
**Demonstrated:** real UI owner create/publish; student required rejection and keyboard rating; persist/reload/relogin; count-only Published, Closed means/bins/literal script text and real row counts
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Exact comment in Closed results plus literal newline in own readback; not direct Closed newline/duplicate comment/deterministic per-question order proof. Partial.

## AC-F05-13
Unsafe comments and all user-authored metadata render as literal text; scripts/event handlers/embedded content do not execute.

**Planned STS:** TEST-F05-U06, TEST-F05-E03
**MAIN source/case:** tests/browser/feedback.spec.ts:3-64 - B23-01 real owner → student → closed results, persisted reload/relogin and validation
**Demonstrated:** real UI owner create/publish; student required rejection and keyboard rating; persist/reload/relogin; count-only Published, Closed means/bins/literal script text and real row counts
**MAIN source/case:** tests/browser/ui-accessibility-real.spec.ts:51-92 - UI-F02/F03 real rejection, retained text, confirmed success focus and Closed results
**Demonstrated:** keyboard requiredrating422/no DBwrites/retained text, linked focus, one201/success focus, Closed mean2.00/literal comment and Backfocus
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Actual script strings render literally, no execution flag/no script DOM; every event-handler/metadata vector not tested.

## AC-F05-14
JSON, DOM, cache/storage, logs and analytics exclude forbidden identity/participation/bundle/timing/auth fields and raw feedback in logs; notice makes no anonymity promise.

**Planned STS:** TEST-F05-U05, TEST-F05-I07, TEST-F05-I09, TEST-F05-E03, TEST-F05-H02
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:603-633 - INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Demonstrated:** per-user false/true submitted; exact ordered own answers; Participation/bundle/answer counts; count-only live view; closed per-question means/bins/null; forbidden identity keys absent
**MAIN source/case:** apps/api/tests/release/g04.test.ts:180-191 - G04-F07: exercised pool logger and normal/error routes omit known secret and feedback markers
**Demonstrated:** positive pool-log entry captured; known password/token/cookie/feedback marker omitted from exercised console outputs
**HISTORICAL G04 source/case:** docs/sprints/sprint-1/g04-supplementary-evidence/original-stdin.mjs - G04-S12 E: captured failure diagnostics contain no injected marker or known secrets
**Demonstrated:** console.error/warn spy saw ZERO entries; proves silence for exercised paths, not exhaustive logger-boundary/transport/analytics certification.
**MAIN source/case:** tests/browser/sprint1-recovery-states.spec.ts:3-41 - B23-05 real expiry clears unsaved private state and ignores a delayed older read; logout survives reload
**Demonstrated:** real expiry clears private unsaved state, held older read ignored; logout survives reload
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Direct forbidden JSONkeys, positive pool-log redaction and historical log silence; full DOM/cache/storage/analytics not audited. Identified notice real browser.

## AC-F05-15
Each result response is one committed snapshot across state/count/definitions/answers, including submit and Close races; no mixed Published/Closed projections.

**Planned STS:** TEST-F05-I10, TEST-F05-I11, TEST-F05-H01
**HISTORICAL G04 source/case:** docs/sprints/sprint-1/g04-supplementary-evidence/original-stdin.mjs - G04-S08 C: Published results keep prior snapshot during concurrent submission
**Demonstrated:** One concurrent second response; uncommitted/other permutations remain covered only where separately evidenced.
**HISTORICAL G04 source/case:** docs/sprints/sprint-1/g04-supplementary-evidence/original-stdin.mjs - G04-S09 C: results projection stays consistent across concurrent Close
**Demonstrated:** Close between state and later results reads; real Close/submit lock orders are separate existing suite evidence.
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Correct historical real read barriers across Submit and Close, separate from sequential INT22-03. Historical source scope; notall Closed definition/answer permutations rerun.

## AC-F05-16
Known storage outage 503 and unexpected/inconsistent data 500 return safe failures, not partial/zero results; Retry performs a safe new read.

**Planned STS:** TEST-F05-I12, TEST-F05-I14, TEST-F05-E04
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:404-416 - F-05: corrupted persisted type/denominator data fails closed rather than producing plausible analytics
**Demonstrated:** persisted answer corruption yields500 RESULTS_INCONSISTENT and no data
**HISTORICAL G04 source/case:** docs/sprints/sprint-1/g04-supplementary-evidence/original-stdin.mjs - G04-S10 D: real PostgreSQL read failure returns no partial result and retry recovers
**Demonstrated:** Real Postgre SQL function raises 57P03 during Answer read; not an actual stopped server/network outage or every results stage.
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Currentmaincorruptresults500 and historical actual SQLread57P03->503/retry; not stopped server/network at all stages.

## AC-F05-17
Repeated reads and restart against unchanged PostgreSQL preserve results/metadata/comment order and all stored rows; GET has no domain writes.

**Planned STS:** TEST-F05-I13, TEST-F05-H01
**MAIN source/case:** scripts/verify-restart.ts - Actual built API stop/start against same database and session secret
**Demonstrated:** compares session deadline/current identity, persisted surveyed definition, own answers and results; not every lifecycle fixture
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:603-633 - INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Demonstrated:** per-user false/true submitted; exact ordered own answers; Participation/bundle/answer counts; count-only live view; closed per-question means/bins/null; forbidden identity keys absent
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Selected built-process restart equality and sequential persisted results; repeated all-comment order/read-only table-hash matrix not fully established.

## AC-F05-18
Owner sees correct Published/Closed view, per-question denominator/mean/table, frozen meaning, comments and truthful identified notice at the proposed navigation handoff.

**Planned STS:** TEST-F05-U06, TEST-F05-E01, TEST-F05-E02, TEST-F05-H01
**MAIN source/case:** tests/browser/feedback.spec.ts:3-64 - B23-01 real owner → student → closed results, persisted reload/relogin and validation
**Demonstrated:** real UI owner create/publish; student required rejection and keyboard rating; persist/reload/relogin; count-only Published, Closed means/bins/literal script text and real row counts
**MAIN source/case:** tests/browser/ui-accessibility-real.spec.ts:51-92 - UI-F02/F03 real rejection, retained text, confirmed success focus and Closed results
**Demonstrated:** keyboard requiredrating422/no DBwrites/retained text, linked focus, one201/success focus, Closed mean2.00/literal comment and Backfocus
**MAIN source/case:** apps/api/tests/features/workflows.test.ts:603-633 - INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities
**Demonstrated:** per-user false/true submitted; exact ordered own answers; Participation/bundle/answer counts; count-only live view; closed per-question means/bins/null; forbidden identity keys absent
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Actual Published/Closed count/mean/bins/comment/frozen meaning/identified notice; every optional message combination incomplete.

## AC-F05-19
Loading, network/database errors, session expiry and denials show §8 states; old/private content is cleared and no premature/fabricated numbers displayed.

**Planned STS:** TEST-F05-E04, TEST-F05-H02
**MAIN source/case:** tests/browser/sprint1-recovery-states.spec.ts:3-41 - B23-05 real expiry clears unsaved private state and ignores a delayed older read; logout survives reload
**Demonstrated:** real expiry clears private unsaved state, held older read ignored; logout survives reload
**MAIN source/case:** tests/browser/sprint1-recovery-states.spec.ts:80-118 - B23-07 real empty contexts and zero results distinguish held loading, delivery error and successful retry
**Demonstrated:** real empty context/zero results, held loading versus delivery error and explicit successful retry
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real empty/loading/delivery failure/retry and session loss; wrong role API separate; entire UI error-state combination incomplete.

## AC-F05-20
Results navigation/Retry and equivalent numerical table work by keyboard with labels/focus/readable layout at 360px and 1280px.

**Planned STS:** TEST-F05-E04, TEST-F05-M01
**MAIN source/case:** tests/browser/ui-accessibility-real.spec.ts:51-92 - UI-F02/F03 real rejection, retained text, confirmed success focus and Closed results
**Demonstrated:** keyboard requiredrating422/no DBwrites/retained text, linked focus, one201/success focus, Closed mean2.00/literal comment and Backfocus
**MAIN source/case:** tests/browser/feedback.spec.ts:3-64 - B23-01 real owner → student → closed results, persisted reload/relogin and validation
**Demonstrated:** real UI owner create/publish; student required rejection and keyboard rating; persist/reload/relogin; count-only Published, Closed means/bins/literal script text and real row counts
**MAIN source/case:** tests/browser/sprint1-recovery-states.spec.ts:80-118 - B23-07 real empty contexts and zero results distinguish held loading, delivery error and successful retry
**Demonstrated:** real empty context/zero results, held loading versus delivery error and explicit successful retry
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Real keyboard Back from results, labelled tables/layout and explicit retry; no full keyboard results/Retry path and all exact viewport conditions certification.

## AC-F05-21
Own unsupported/anonymous mode is safely rejected with no text/count fallback; no S2 thresholds, export, history or overall instructor score are added.

**Planned STS:** TEST-F05-U04, TEST-F05-I02
**MAIN source/case:** apps/api/tests/post-release/ac-gaps.test.ts:104-119 - PR46-I03 / AC-F05-21 / TEST-F05-I02: own ANONYMOUS Published and Closed results reject without count or text fallback
**Demonstrated:** Current main PASS: Published/Closed results unsupported mode409/no count/text
**Disposition:** Selected assertions evidenced; AC remains Partial where listed conditions are not demonstrated.
**Remaining limit:** Additional real API unsupported mode Published/Closedresults409/noanswers/count fallback; current production enum IDENTIFIED only; not S2anonymousacceptance.

## AC-F05-22
Reviewed/versioned precode interfaces/schema/rounding and mapped STS exist before dependent implementation; later acceptance records actual results, meaningful TDD and human review, leaving release/PDF gates separate.

**Planned STS:** TEST-F05-M02, TEST-F05-H01, TEST-F05-H02
**PROCESS source/case:** docs/deliverable-1/release-process-and-contributions.md - Actual preimplementation contracts, RED/GREEN commits, teammate reviews and staging/main ancestry
**Demonstrated:** recorded commits/reviews establish sampled engineering sequence; not every planned STS permutation or unreported human work
**Disposition:** Process evidence inspected; no automated Pass or exhaustive Done claim.
**Remaining limit:** Correct process/history evidence, no unrelated INT22-03/06 as proof of pre-code contracts/rounding review. Full human report acceptance pending.

