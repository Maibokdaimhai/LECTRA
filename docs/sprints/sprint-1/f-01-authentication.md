# F-01 - Authentication, Sessions and Backend Access Contract

Version 0.3, 2026-11-06: synchronize staging and clarify phased database dependencies after [PR #29 review](https://github.com/Maibokdaimhai/LECTRA/pull/29#pullrequestreview-5803314777); AC and STS IDs unchanged. Status: proposed preimplementation contract for [#10](https://github.com/Maibokdaimhai/LECTRA/issues/10), under [Part E #5](https://github.com/Maibokdaimhai/LECTRA/issues/5). Lead: Maibokdaimhai; reviewer: R1NNE0 (changes requested; re-review pending). No teammate approval, installed dependency, migration, implementation or executed application test is claimed.

Product baseline originated at `333a9fc6a6a2905b07087c98eb5f5d931ffec107`. Proposed with the shared prerequisite on `docs/5-sprint1-shared-contracts`; synchronized with `staging` at `b3f644a7ca42c3750a7f673153aeba87d3c6d999`, preserving the merged PR #27 tracker and PR #28 workflow. Actual publication/review versions are recorded in #5/#10 and PR #29; changes-requested review is not approval. Related implementation: [#17](https://github.com/Maibokdaimhai/LECTRA/issues/17); setup [#15](https://github.com/Maibokdaimhai/LECTRA/issues/15); database [#16](https://github.com/Maibokdaimhai/LECTRA/issues/16). Test design: [F-01 STS](f-01-authentication-sts.md). Shared references: [register](README.md), [engineering conventions](shared-contract.md), [Product DoD](product-dod.md).

## 1. Authority, scope and dependencies

| Source | Required outcome or selected design |
| --- | --- |
| Instructor: `group_work_specs_v1.pdf` section 5.2, Theme 10 and section 8.2; `project_deliverable_1_v1.pdf` sections 2, 3.5 and 3.6 | Real login/logout/current identity, meaningful roles, hashed credentials, backend access restrictions, preimplementation feature design/AC/STS/DoD, actual automated verification and substantive teammate review. Authentication alone does not complete Sprint 1. |
| Existing LECTRA baseline: [SRS](../../srs.md), [SDS sections 4-5](../../system-sds.md), [feature inventory](../../features.md) | Seeded OWNER/RESPONDENT accounts; PostgreSQL-backed opaque sessions; Argon2id; absolute eight-hour authenticated lifetime; synchronizer CSRF token and Origin checks; same-origin delivery; no signup/recovery/SSO. |
| This contract, proposed team detail | Exact payloads/errors, 30-minute preauthentication session, input limits, cookie names, package candidates, logout no-op policy, throttling and test IDs below. These are design choices, not instructor-prescribed numbers or protocols. |

Requirement links: FR-01; BR-01/BR-02; NFR-01/03/05/07/08; SYS-01/02/03. FR-12 supplies seeded identities through SYS-01. Full record-level BR-02 verification also belongs to F-02-F-05 and integrated Sprint 1 tests; the authentication foundation cannot certify routes that do not exist yet.

In scope: four auth endpoints; login/session-expiry/logout UI behavior; reusable authenticated/role/record-scope boundaries; session and User schema coordination; safe identity/error/cache/log projections. All UI/API/data layers need work. Survey/answer/result schemas and business transitions have no change in F-01; their own contracts supply them. No user-management UI, password changes, remember-me, token refresh, JWT/local-storage credentials, anonymous answers or deployment setup is added.

Drafting #10 does not wait for every other contract or for umbrella #5 to close. Before #17 implementation, obtain actual teammate review of this version, adopt/reconcile the shared draft Product DoD/ID conventions in #5, and record the needed verified #15/#16 User/session foundation. Unrelated later domain schema/UI work is not a prerequisite to authenticating a seeded account. Domain feature implementers consume this interface and add real ownership/eligibility checks on their routes. #22/#23 own cross-feature integration/browser evidence; #25/#26 own release/PDF evidence.

The initial #16 User/auth_session migration and hashed synthetic login-account seed require accepted #10/shared conventions and #15 setup, not every #11–#14 contract or full #16 closure. Subsequent context/survey/response/results schema work waits for its respective reviewed contract. #17 may proceed after the verified initial subset; the full #16 Issue remains Open until all its S1 scope is evidenced. This matches the [register](README.md) and [tracker](tracker.md), and does not authorize domain implementation from an auth-only schema.

## 2. Component and dependency contract

Proposed modules after authorized setup: `apps/api` auth routes/services/guards plus session-store configuration, `apps/web` login/auth state/API wrapper, and `prisma/migrations` for domain and custom session SQL. Paths are planned, not existing source files. Use Node `crypto` for random tokens and length-checked constant-time comparison; use maintained session/hash middleware rather than a custom cookie signature algorithm.

Registry metadata inspected on 2026-11-06 provides the following candidates. This is a reproducible selection proposal, not a completed installation/compatibility run. #15 must pin exact Node/npm/PostgreSQL patch versions, all direct dependencies/dev types and one `package-lock.json`, then demonstrate install/typecheck/build/hash/session/migration smoke checks before #17. Record any justified candidate change here before coding against a different API.

| Component | Proposed candidate | Compatibility/setup responsibility |
| --- | --- | --- |
| Runtime / manager / database | Node 24 LTS line; npm 11.16.0; PostgreSQL 17 line; UTC DB connections | #15 records exact Node/PostgreSQL patches and both students' actual platforms. Node 24 satisfies the inspected engine ranges; native Argon2 and DB execution remain unverified. |
| API and validation | express 5.3.0; zod 4.6.7; TypeScript 5.9.3 | #15 pins compatible Express/Node type packages; no assumption that the registry's newest TypeScript major is appropriate. |
| Sessions | express-session 1.19.0; connect-pg-simple 10.0.0; pg 8.23.1 | Add compatible `@types/express-session`, `@types/connect-pg-simple`, `@types/pg` where needed. #16 versions session DDL; #17 configures store behavior. |
| ORM | prisma, @prisma/client and @prisma/adapter-pg all 7.10.1 | Keep the three versions aligned. Use the PostgreSQL driver adapter required by the selected Prisma 7 design; #15 owns module/generator/config setup. Do not mix a prerelease CLI with a different client. |
| Passwords / throttling | argon2 0.45.2; express-rate-limit 8.7.3 | #15 verifies native hash/verify on actual machines; #17 supplies the configured limiter and safe error mapping. |
| Verification candidates | Vitest 5.1.0; Supertest 7.3.1; @playwright/test 1.65.0 | #15 coordinates Vite 8.3.6/React 19.3.1 and actual peer resolution with the web setup. Candidates share Node 24 support; browser installation/execution has not occurred. |

`pg`, `@prisma/adapter-pg` and `express-rate-limit` are explicit additions to the earlier named stack. No CSRF package, JWT library, Redis service, UI framework or account-administration dependency is required by this proposal. Do not interpret this list as authorization to install packages.

## 3. Session lifecycle and authority

### 3.1 States and transitions

| State | Behavior |
| --- | --- |
| No usable session | Protected reads return 401. Bootstrap may create a guest session containing a CSRF token and fixed 30-minute guest deadline; it grants no role. |
| Guest/preauthentication session | Login requires its token and matching Origin. Repeated bootstrap preserves its token/deadline; it does not extend lifetime. |
| Successful login | Verify credentials, regenerate SID (destroy old guest session), create a new CSRF token, set trusted user ID/authenticatedAt/authExpiresAt, and await store save before returning success. The old SID/token must not authorize requests. |
| Authenticated session | Re-resolve User from PostgreSQL on each protected request. Keep only user ID, security timestamps/token and middleware cookie metadata in the session; never store trusted role/ownership claims from the client. |
| Expired/invalid session or missing User | Deny access, invalidate the session where available and clear stale cookie. Bootstrap can replace it with a guest session. Never silently authenticate or renew the old session. |
| Logout | For a live session, validate Origin/CSRF, destroy it in PostgreSQL and clear the cookie only after confirmed revocation. Subsequent requests using the saved old cookie are unauthorized. |

Multiple independent logins are permitted; logout revokes that browser's session only. There is no logout-all-devices or single-session-per-account rule. No role-changing API exists; a trusted DB role change is reflected on the next request. A deleted User or invalid persisted role makes a session unusable, rather than trusting a stale role in JSON.

### 3.2 Lifetime and persistence

Authenticated lifetime is exactly `28,800,000` milliseconds from the server-recorded successful authentication time; access is permitted only while `authenticatedAt <= now < authExpiresAt`. Validate timestamp types/order and `authExpiresAt = authenticatedAt + 28,800,000`; future authentication times or malformed state are rejected. At the exact deadline, access fails. Guest lifetime is `1,800,000` milliseconds and never confers authenticated access. Use UTC instants, not local calendar arithmetic.

Set `resave: false`, `saveUninitialized: false`, `rolling: false`, store `disableTouch: true`, and `createTableIfMissing: false`. Bootstrap intentionally initializes/saves a guest session despite saveUninitialized being false. Do not mutate/save live auth sessions on ordinary reads. Cookie and store deadlines must not exceed the recorded absolute deadline, including explicit save/touch paths: cap the cookie's serialized expiry and store `set` expiry to that deadline, not now plus another eight hours. A small store/response adapter may enforce the cap after middleware resets; finalize its tested implementation in #17. Server age checks remain authoritative even if a cookie is manually replayed or the store retains an expired row. Never rely only on eventual pruning or browser cookie removal.

Only bootstrap/login/logout may write auth session state. Ordinary domain handlers cannot rewrite it. Await save/regenerate/destroy callbacks and handle errors before success. After logout acknowledgement, concurrent completed reads must not recreate an old SID through resave/touch; exercise an overlapping read/logout test. A request authorized before logout may finish; this contract does not promise cancellation of already authorized in-flight domain transactions.

Application restart uses the same PostgreSQL store and secret configuration; unexpired sessions remain usable without resetting their absolute deadlines. A changed session secret may invalidate cookies; do not call that persistence success or add secret rotation accidentally. Invalid signatures, expired/missing rows and unrecognized client-chosen SIDs never grant identity.

## 4. Credentials, schemas and migration ownership

### 4.1 Credential input and hashing

Login accepts exactly `email` and `password`. Normalize email with surrounding trim and lowercase consistently with seeded unique email storage; support the seeded ASCII email format, length 1-254 characters after normalization, with syntactically valid email. Password is a string of 1-128 Unicode code points, with no trim, lowercase, normalization or silent truncation. This is a login bound, not a new-user password policy. Synthetic seed passwords are at least 12 characters and satisfy the bound. Blank email/password produces 422; a nonempty whitespace password is checked exactly and normally fails credentials.

Use Argon2id PHC-encoded hashes with fresh random salt (at least 16 bytes), memoryCost at least 19,456 KiB, timeCost at least 2, parallelism 1 and hash length at least 32 bytes. This selected starting configuration follows the referenced OWASP guidance; measure the actual native implementation in setup before increasing cost. Seed does not store plaintext. Unknown email executes verification against a fixed synthetic dummy hash with the same cost, then returns the same 401 body as a wrong password. This reduces a timing discrepancy without promising timing indistinguishability. A malformed stored hash/internal verifier failure is a safe server failure, never successful authentication.

No real password/hash, email/password body, SID cookie or CSRF value enters logs, screenshots or evidence. Test-only synthetic credentials may be supplied through explicit local seed/test configuration; keep actual secret values out of Git/PDF. Treat API bodies as untrusted; SQL access is parameterized.

### 4.2 Domain schema contract

| User field | Proposed storage / constraint | Use |
| --- | --- | --- |
| id | UUID primary key, generated by trusted server/seed | Opaque application identity; not supplied to choose the logged-in actor. |
| email | Unique normalized varchar(254), non-null | Lookup only; self identity does not need to return it. Seed rejects normalization collisions. |
| passwordHash | Non-null text containing Argon2id PHC encoding | Server/seed only; excluded from all projections. |
| role | Non-null enum OWNER or RESPONDENT | Loaded from trusted User table on each protected request. |
| displayName | Non-null 1-120 code points | Safe self projection, rendered as plain text. |

This refines the User model already allocated to #16, not a second User table/migration. #16 authors/co-ordinates one domain migration/seed; #17 consumes it and must not create a competing initial schema. Demo fixtures include two owners and at least two respondents with synthetic `.test` addresses; Section/eligibility fixtures for domain tests remain #16/F-02-F-05.

### 4.3 Session store DDL contract

Version custom SQL alongside Prisma migrations, using connect-pg-simple's table shape with the selected name `public.auth_session`:

| Column / object | Contract |
| --- | --- |
| sid | varchar, non-null primary key; middleware-generated identifier. Treat as a credential in storage/log policy. |
| sess | json, non-null; middleware cookie metadata plus guest/auth payload described below. No password, raw answers or trusted cached role. |
| expire | timestamp(6) without time zone, non-null, following the store adapter's schema; UTC connection/session timezone is required for correct interpretation. |
| expiry index | B-tree on expire, named `auth_session_expire_idx`; prune expired rows without using pruning as authorization. |

Payload is a discriminated guest or authenticated state: guest has `csrfToken`, `guestCreatedAt`, `guestExpiresAt`; auth has `userId`, `authenticatedAt`, `authExpiresAt`, `csrfToken`. Times are epoch milliseconds; token is 32 random bytes in unpadded base64url (43 characters). Session JSON is internal, never an API identity source supplied by clients. No User FK exists inside JSON; trusted User lookup invalidates deleted/unknown accounts.

#16 owns copying/adapting the selected package DDL into a reviewed Prisma migration, omitting obsolete `WITH (OIDS=FALSE)` syntax from the upstream sample for PostgreSQL 17, and matching table/index names above. Do not enable runtime auto-create, run an unversioned package SQL file on startup, or let Prisma subsequently drop an unmanaged table. Represent the session table in Prisma's migration schema (mapped names/types) or explicitly exclude it using a tested migration strategy; #15/#16 must demonstrate a second no-op migration does not drop/change it. Domain application code still accesses sessions only through the store. Store and ORM may use separate pools against the same database; startup/shutdown closes both.

Repeatable seed does not reset authenticated sessions silently on startup. Migrate explicitly before service startup; tests fail early if the schema is absent. Tests use an explicitly allowlisted disposable test database and separate credentials/URL; test reset must refuse development/deployed DBs. Missing tables/DB failures must not fall back to memory.

## 5. Browser security and request processing

### 5.1 Configuration profiles

| Profile | Origin / transport / proxy | Session cookie |
| --- | --- | --- |
| Local development/test HTTP | Exact configured origin such as `http://localhost:5173`; Vite proxies `/api`; Express trust proxy false | `lectra.sid`; HttpOnly; SameSite=Lax; Path=/; no Domain; Secure=false explicitly. Loopback-only development; not a public HTTP profile. |
| HTTPS deployment | One exact configured HTTPS origin; frontend/API share it; trusted ingress path explicitly verified in Lab 5 | `__Host-lectra.sid`; HttpOnly; Secure; SameSite=Lax; Path=/; no Domain. Absolute remaining lifetime only. |

Clearing uses the same cookie name/path/domain/security attributes, with an expired value; do not accidentally leave a second-path cookie. No remember-me checkbox or local/session-storage bearer credential. Cookie settings are backend configuration, not a client-selected switch. Reject missing/weak session secret (minimum 32 random bytes), malformed/multiple/wildcard APP_ORIGIN and inconsistent production HTTP/cookie settings before listening. No real secret is shown in example configuration.

Planned server configuration: `APP_ORIGIN`, `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV` and validated deployment-specific trust-proxy setting. Test DB configuration belongs to #15. Do not accept forwarded protocol/host/IP as trusted by default, compute allowed Origin from an untrusted Host header, set trust proxy true for all callers, or enable permissive credentialed CORS. Direct local API port is an implementation service, not a second browser origin. HTTPS/proxy behavior must be tested using the actual documented proxy path before cloud use; no Cloud Run access/path is assumed here.

### 5.2 Origin, CSRF and precedence

Unsafe methods require a single Origin exactly equal to configured scheme/host/port, after standards-based URL-origin normalization. Reject missing, `null`, multiple, foreign, wrong-scheme or wrong-port Origin with 403 ORIGIN_FORBIDDEN. No Referer or forwarded-header fallback. All browser callers use same-origin fetch; do not forward CSRF headers to unrelated URLs. Bootstrap/read requests reject an explicitly foreign Origin; bootstrap also rejects `Sec-Fetch-Site: cross-site`. Same-origin reads may omit Origin. No CORS permission is emitted for other origins.

`GET /api/auth/session` creates/returns a session-bound token; never put it in a URL, cookie readable by JS, persistent browser storage or logs. Unsafe requests send `X-CSRF-Token`. A live session requires exact token equality after fixed-format/length validation; compare equal-length bytes in constant time. Missing/wrong/cross-session/old pre-login tokens return 403 CSRF_INVALID. Token persists within a session and rotates on login regeneration; do not rotate on every GET and break parallel tabs. It is held in memory and refreshed from bootstrap when necessary.

Logout no-op exception: for an absent, expired or already revoked session, a same-origin logout with an empty JSON object and a correctly formatted token returns 204 and clears the stale cookie; there is no live session against which to compare it and no privilege is granted. Missing/malformed token is still 403. For every live guest/auth session, exact equality remains mandatory. This narrowly specified exception makes replayed logout idempotent; it is not a bypass for login, domain writes or logout of a live session. Tests distinguish these branches explicitly.

Use this rejection order so mixed-invalid cases have predictable results:

1. Origin and method policy, then transport/content-type/body-byte bounds, then session-store loading and safe parser errors. Unsupported method is 405 with Allow; no GET logout.
2. On protected domain operations, resolve authentication before CSRF, then role, then scoped record lookup/business validation. A correctly originated unauthenticated request returns 401, not private record data. Do not reveal whether a hidden record exists.
3. Login: live guest/bootstrap and CSRF check, active-authenticated-session conflict check, strict body validation, login rate limit, trusted credential verification, regeneration/save, success. An invalid/expired bootstrap produces CSRF_INVALID and requires rebootstrap, never a token exemption.
4. Logout: token policy above, strict empty-object validation, destroy/clear or no-op. Do not turn a store failure into the no-op branch.

No application state-changing operation uses GET. Bootstrap writes security session metadata only. Clients never automatically retry a login/domain mutation merely because a token expired; obtain a fresh token and require a deliberate resubmission. A 401 clears private client state; 403 role denial does not claim the session expired.

## 6. Exact API contract

All four endpoints return `Cache-Control: no-store`; auth requests use JSON and `credentials: same-origin`. Authentication responses never include passwordHash, SID, cookie signature, other users, Section memberships or feedback. The safe user projection is exactly `id`, `displayName`, `role`. Auth timestamps returned as `expiresAt` are ISO-8601 UTC instants. CSRF token is returned only by bootstrap and successful login.

| Method/path | Input / precondition | Success |
| --- | --- | --- |
| GET /api/auth/session | No body. Usable guest/auth cookie optional; token bootstrap policies apply. | 200 `{ "data": { "authenticated": false, "user": null, "expiresAt": null, "csrfToken": "<token>" } }` for guest. Authenticated form has true, safe user, absolute expiresAt, same session token. Guest deadline remains server-internal. |
| POST /api/auth/login | Valid bootstrap cookie/token, matching Origin; exact JSON `{ "email": "owner-a@example.test", "password": "<synthetic input>" }`. | 200 `{ "data": { "user": { "id": "<uuid>", "displayName": "Owner A", "role": "OWNER" }, "expiresAt": "<UTC instant>", "csrfToken": "<new token>" } }` and regenerated signed session cookie. RESPONDENT uses the same shape. |
| GET /api/auth/me | Valid unexpired authenticated session; no body. | 200 `{ "data": { "user": { "id": "<uuid>", "displayName": "Owner A", "role": "OWNER" }, "expiresAt": "<UTC instant>" } }`. Missing/invalid auth returns 401. |
| POST /api/auth/logout | Matching Origin, token policy above, exact JSON `{}`. | 204, no body, cookie cleared after confirmed destruction or defined no-op. No redirect response or GET logout route. |

Examples are shape illustrations, not issued tokens/users/results. Success is sent only after the required PostgreSQL operation completes. Login while already authenticated returns 409 ALREADY_AUTHENTICATED with no identity switch, deadline renewal or mutation; use logout before changing account.

Auth POST transport limit is 8,192 encoded bytes, separate from F-04's response-body limit. Accept only application/json (optional UTF-8 charset), no content compression, JSON object bodies only. Reject extra keys (including role/userId/ownerId/studentId), arrays/null, wrong types, missing fields and length violations; never silently strip spoofing fields or use them as authority. Enforce both byte limit and decoded limits. Ignore identity claims in unrelated headers/query strings/cookies as permission sources; only the signed session and trusted User lookup determine the actor.

### Error envelope and outcomes

Use `{ "error": { "code": "CODE", "message": "safe text" } }`; validation alone may include `fields: { "email": "safe reason", "password": "safe reason", "_form": "safe reason" }`. Do not echo input values or internal messages. Shared #5 must adopt/reconcile these codes before feature implementation.

| HTTP / code | Condition / safe client behavior |
| --- | --- |
| 400 MALFORMED_JSON | Invalid JSON syntax; no credential/hash/session-auth mutation. |
| 401 INVALID_CREDENTIALS | Unknown email and wrong password have exactly the same code/message: `Email or password is incorrect.` No authenticated session created. |
| 401 AUTH_REQUIRED | Missing, forged, revoked, invalid-state session or missing/invalid User. Clear stale/private client state; never expose another account. |
| 401 SESSION_EXPIRED | Server can identify a loaded auth session at/past its deadline; otherwise missing/pruned expiry uses AUTH_REQUIRED. UI treats both as session loss. |
| 403 ORIGIN_FORBIDDEN / CSRF_INVALID | Failed Origin or token policy; no login/logout/domain mutation. Rebootstrap deliberately for token loss; no automatic POST replay. |
| 403 FORBIDDEN_ROLE | Authenticated wrong role on a role-only route. No private response fields. |
| 404 NOT_FOUND | Missing or inaccessible record after a correct role check; same outward shape. Domain contracts supply actual routes/scoped queries. |
| 405 METHOD_NOT_ALLOWED | Known auth path with unsupported method; Allow lists supported methods, with no side effect. |
| 409 ALREADY_AUTHENTICATED | Login cannot silently replace/renew a live authenticated account. |
| 413 BODY_TOO_LARGE / 415 UNSUPPORTED_CONTENT | Auth body exceeds 8 KiB / unsupported content type or compression. Reject before hashing or auth writes. |
| 422 VALIDATION_FAILED | Well-formed body violates the exact login/logout schema; safe field errors only. |
| 429 LOGIN_RATE_LIMITED | Login attempt bound exceeded; safe message and integer Retry-After seconds, no account-existence detail. |
| 503 AUTH_SERVICE_UNAVAILABLE | Session get/set/regenerate/destroy or trusted User lookup fails due to unavailable DB/store. No memory fallback, partial success or claim of completed logout. |
| 500 INTERNAL_ERROR | Unexpected failure, including corrupt stored hash/internal verification failure; no raw stack/SQL/credential output. |

Throttling proposal: one local API process permits ten schema-valid, correctly originated/tokened login attempts per trusted client IP per 15-minute window, including success/failure; the eleventh is 429 before hashing. Use the package's IP normalization/IPv6 behavior, not a naive forwarded-header key. No account lockout, user-specific threshold or CAPTCHA is added. Reset/test it using an injected/test clock without 15-minute sleeps. Local in-memory throttle counters are explicitly process-local and reset on restart; authentication sessions remain PostgreSQL-backed. Before public multi-instance deployment, #15/Lab 5 must adopt/review a shared limiter store or equivalent ingress policy and verify proxy/IP/rate behavior. This local limiter is not a claim of distributed abuse prevention.

## 7. Backend access and UI contract

### 7.1 Guard interfaces and domain handoff

Authentication middleware produces immutable request-local `actor: { userId, role }` after trusted lookup. A role guard consumes that actor; a scoped record loader uses its userId in the server/database predicate. Do not accept an actor object from request JSON or authorize by matching two client-supplied IDs. Resource absence/out-of-scope is 404. Caller-supplied Section/Course context cannot broaden the predicate. Each domain feature must enforce its own guard on every route, not just its list UI.

| Operation | Guest | RESPONDENT | OWNER |
| --- | --- | --- | --- |
| Bootstrap/login/logout/me | Endpoint-specific rules above | Own session only | Own session only |
| Owner-only context/Draft/lifecycle/results | 401 | 403 | Scoped to own Section/lecture/survey; out-of-scope 404. |
| Eligible survey read / response / own submission | 401 | Eligibility/state/own-user constraints; hidden record 404; own actor only. | Role-only respondent operation 403; owned preview is a separate owner read. |
| Another respondent's answers / per-student owner participation list | 401 | No cross-user endpoint/permission. | No respondent-linked answer or participation-list endpoint. |

F-01 guard tests can use a test-only handler harness to demonstrate role/status handling; do not ship debug routes or call that real survey access coverage. F-02-F-05 contracts and #22 must run direct API/real-DB ownership, same-Course/different-Section, eligibility and cross-response tests on actual feature routes. No hidden UI button or demo role dropdown grants permission.

### 7.2 UI behavior

Use the existing [cool-theme SDS](../../system-sds.md) tokens/components, light theme only; no new palette/library. Login card max width 440px, labelled email/password, one Log in action, no role selector. Password uses type=password and autocomplete=current-password; email uses autocomplete=username. Native keyboard/form behavior is supported; do not disable password-manager paste.

| UI state / event | Observable behavior |
| --- | --- |
| Initial auth check | Bootstrap/check current identity before private content renders. Show a bounded loading state; no flash of another user's page or synthetic authenticated identity. |
| Ready / submit | Client checks required/format limits for feedback; server repeats validation. Submit once while busy, disable repeated action and announce progress. No success navigation before 200. |
| Valid login | Replace auth/token state from server; clear old private caches first. OWNER opens owner context shell; RESPONDENT opens eligible-survey shell. Domain data/empty states are F-02, not fabricated seed cards in F-01. |
| Invalid credentials / validation | Show generic credential message or linked field errors, move focus to error summary; preserve email, clear password after the completed attempt. Password never survives reload or enters persistent storage. |
| Token/Origin error | Show safe error; token loss may refresh bootstrap for a deliberate retry. Never retry credentials automatically or preserve a password for background resend. Origin misconfiguration is reported as setup failure. |
| Network/server/rate error | Show safe retry instruction; 429 respects Retry-After. A timed-out login has unknown outcome: bootstrap/current identity before another deliberate login, rather than asserting failure or blindly resending. |
| Protected request returns 401 | Clear actor/private queries/answer drafts and in-memory old CSRF token; show login with a session-ended message. Rebootstrap before deliberate login. Do not promise unsent-answer recovery. |
| Logout clicked | Immediately stop private rendering and clear private state; block new protected navigation while revocation is pending. Retain token only transiently for the logout retry. |
| Logout 204 | Clear all local auth/token state, show login; back/direct navigation cannot restore private content without a fresh authenticated server check. |
| Logout error/timeout | Private UI remains hidden; state says server sign-out is not confirmed. Offer a deliberate retry/bootstrap check, with no false success. Do not erase the ability to retry revocation and imply the server session is gone. |

Auth context is memory-only; browser refresh resolves from server. Shared tabs can encounter expiry/logout via their next authenticated read or visibility revalidation; they must not reuse cached private content after a detected 401. This does not promise instantaneous cross-tab notification. Test labels, keyboard submit/focus, busy/error states and no horizontal page overflow at 360px/1280px; final UI review may supplement with 320px reflow/200% zoom per SDS.

## 8. Stable acceptance criteria and verification map

All AC below are proposed, observable implementation outcomes. All tests/checks are Planned, not passed. Their complete preconditions/action/assertions are in the [STS](f-01-authentication-sts.md). IDs remain stable; append rather than renumber accepted IDs.

| ID | Required observable outcome | Planned verification IDs |
| --- | --- | --- |
| AC-F01-01 | Bootstrap returns a persisted session-bound token, correct guest/auth projection and no-store; repeated live bootstrap does not renew token/deadline. | TEST-F01-I01, I27 |
| AC-F01-02 | Exact login/logout schema and transport/decoded bounds reject malformed, oversized, unsupported or identity-spoofing bodies without authentication writes. | TEST-F01-U01, I06, I15 |
| AC-F01-03 | Each seeded role can log in with exact password and normalized email; /me returns the trusted safe current identity. | TEST-F01-I03, I04, E01 |
| AC-F01-04 | Unknown email and wrong password return the same 401 body without authenticated session; existing auth is not silently switched/renewed by login. | TEST-F01-I05, I28 |
| AC-F01-05 | Stored credentials are salted Argon2id; exact nontrimmed password verification succeeds/fails correctly; corruption/errors never grant identity. | TEST-F01-U06, I24, I26 |
| AC-F01-06 | Successful login regenerates SID/token, destroys guest SID and waits for durable save; old token/SID cannot authenticate. | TEST-F01-I07, I13 |
| AC-F01-07 | Auth is valid just before eight hours and denied exactly at/after it; reads/touch/save/restart cannot extend cookie/store/server deadline. Invalid/future timestamps fail. | TEST-F01-U02, U07, I08, I20 |
| AC-F01-08 | Every protected request resolves trusted User/role; deleted/invalid users lose auth and client identity claims never elevate permission. | TEST-F01-I09, I15 |
| AC-F01-09 | Confirmed logout revokes the stored session; cookie replay is unauthorized; repeated/absent-session logout follows the documented token no-op policy. | TEST-F01-I16, I17, E02 |
| AC-F01-10 | Login/logout/unsafe routes enforce exact Origin and session-bound CSRF, including cross-session/old-token rejection and the explicit logout-only no-op branch. | TEST-F01-U03, I13, I14, I17, E04 |
| AC-F01-11 | Local HTTP versus HTTPS cookies, clearing and validated proxy/configuration behave as specified; spoofed forwarded headers do not make an insecure caller trusted. | TEST-F01-I02, I25, M02 |
| AC-F01-12 | Guard boundary gives unauthenticated 401, authenticated wrong-role 403 and missing/out-of-scope 404 without private data. Real domain integrations remain explicitly assigned. | TEST-F01-U04, I10, I11, I12, H01-H04 |
| AC-F01-13 | DB/store/verifier failures produce safe failure, never memory fallback or successful login/logout acknowledgement; failed revocation remains disclosed/retryable. | TEST-F01-I18, I26, E05 |
| AC-F01-14 | Auth errors/identity projections/logs/cache behavior expose no credentials, SID, other-user payload or private cached content after session loss. | TEST-F01-U05, I23, E02, E03 |
| AC-F01-15 | Login has usable labelled/keyboard/busy/error/timeout behavior and server-derived role navigation at the specified widths. | TEST-F01-E01, E04, M01 |
| AC-F01-16 | Session expiry/logout hides private UI, rechecks before protected re-entry and distinguishes server-revocation failure from success. | TEST-F01-E02, E03, E05 |
| AC-F01-17 | Reviewed migration/seed and test-DB safeguards reproduce User/session storage; sessions survive restart with unchanged absolute deadline. | TEST-F01-I20, I24, I25, M02 |
| AC-F01-18 | The tenth allowed attempt and eleventh rejected attempt/reset behave under the documented per-process limiter; public distributed limitation is explicit. | TEST-F01-I22 |
| AC-F01-19 | Concurrent session reads do not resurrect a revoked session; logging out one independent session does not revoke another. | TEST-F01-I19, I21 |
| AC-F01-20 | Preimplementation contract/test-design versions, reviewed Product DoD, actual test results and substantive teammate integration are linked before F-01 is called Done. | TEST-F01-M03 |

## 9. Completion, TDD and unresolved gates

The [Product Definition of Done v0.1 draft](product-dod.md) is owned by [#5](https://github.com/Maibokdaimhai/LECTRA/issues/5) and exists alongside this contract; it has not yet been human-reviewed/adopted. This F-01 checklist specializes DOD-01-DOD-10, with DOD-11-DOD-12 applied at integrated release/report scope. Record the actual accepted DoD commit/review before #17; do not treat this link as approval. The following remains a proposed feature completion checklist:

- [ ] Feature contract and STS are versioned and substantively reviewed before #17 implementation; shared ID/error/DoD conventions are agreed under #5.
- [ ] #15 runtime/package/type/module choices and #16 User/session migration ownership are verified; record lockfile/schema versions and both contributors' actual work.
- [ ] Applicable AC are implemented across UI/API/PostgreSQL; actual domain access handoff checks H01-H04 run under their feature/integration ownership before claiming full BR-02/Sprint 1 completion.
- [ ] Unit, real API/DB and selected browser checks execute with actual file/name/command/SHA/pass-fail-skip counts; justified manual checks supplement them. No required test is silently skipped or weakened.
- [ ] Preserve intended-behavior RED then GREEN for absolute expiry, SID/CSRF regeneration, logout replay and trusted role guard rules. An unrelated import failure is not sufficient TDD evidence.
- [ ] Actual opposite-member PR review, findings/recheck and integration are linked. Build/typecheck and relevant regression use the integrated version; release build/tests later target the actual accepted main SHA under #25.
- [ ] Actual setup/config/migrate/seed/run/check commands, cookie profiles, limitations and evidence references are documented. Source/tests/docs remain in the repo; #26 places assessable selected evidence in the single report PDF.

Record each run as test ID, actual source/test file, intended/observed behavior, command, environment/schema/lockfile version, tested SHA and counts/output link. For RED/GREEN keep both real versions/results when they occur. Proposed file names and commands in STS are not execution evidence. This documentation task does not implement tests or produce an application PASS result.

| Gate / team decision | Proposed disposition / required evidence |
| --- | --- |
| #5 shared DoD and naming/error consistency | Draft shared register/conventions/Product DoD now exist and retain these AC-F01 / TEST-F01 IDs/auth envelope; accept or revise coherently before #17. Do not wait for every child contract or call #5 complete from F-01 alone. |
| OPEN-02 runtime compatibility | Candidates are metadata-checked only. #15 must record exact runtime patches, one lockfile, native hash and actual client/store/migration smoke results; update this contract on a material change. |
| Session migration ownership | #16 owns one reviewed User/session migration; #17 configures the store, caps immutable deadlines and supplies runtime tests. Demonstrate UTC handling and no accidental Prisma drop. |
| Logout exception / lifetime caps | Teammate must inspect the no-live-session token policy, middleware/store save/expiry cap and concurrent read/logout cases before contract acceptance. No blanket CSRF exemption is proposed. |
| Local versus public throttle/proxy | Local single-process limiter proposed for S1; shared deployment control and exact ingress trust remain a Lab 5 gate. Do not claim public deployment readiness from local counters. |
| Real record-level authorization | F-02-F-05 contracts consume actor/guards and supply route-specific real-DB tests; #22 closes integration gaps. A passing guard harness alone is insufficient. |

## 10. Technical sources

Sources guide implementation choices; they do not create instructor requirements. Metadata/documentation inspected on 2026-11-06; pin and recheck during #15 rather than install `latest` blindly.

- [Express session API](https://expressjs.com/en/resources/middleware/session/): session storage/callback/cookie semantics, including save/touch behavior.
- [connect-pg-simple](https://github.com/voxpelli/node-connect-pg-simple) and [v10 table shape](https://raw.githubusercontent.com/voxpelli/node-connect-pg-simple/v10.0.0/table.sql): store/schema/expiry options; review SQL for the target PostgreSQL version.
- [Prisma 7 system requirements](https://www.prisma.io/docs/orm/v7/reference/system-requirements) and [connection pools](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/databases-connections/connection-pool): runtime/driver-adapter setup.
- [node-argon2](https://github.com/ranisalt/node-argon2), [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), and [OWASP CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html): credential and preauthentication/CSRF guidance.
- [Node release lifecycle](https://nodejs.org/en/about/previous-releases) and [express-rate-limit](https://express-rate-limit.mintlify.app/overview): runtime selection and local/distributed limiter boundaries.
- Exact candidate metadata examples: [express 5.3.0](https://registry.npmjs.org/express/5.3.0), [session 1.19.0](https://registry.npmjs.org/express-session/1.19.0), [store 10.0.0](https://registry.npmjs.org/connect-pg-simple/10.0.0), [prisma 7.10.1](https://registry.npmjs.org/prisma/7.10.1), [client 7.10.1](https://registry.npmjs.org/@prisma%2Fclient/7.10.1), [adapter 7.10.1](https://registry.npmjs.org/@prisma%2Fadapter-pg/7.10.1), [pg 8.23.1](https://registry.npmjs.org/pg/8.23.1), [argon2 0.45.2](https://registry.npmjs.org/argon2/0.45.2), [limiter 8.7.3](https://registry.npmjs.org/express-rate-limit/8.7.3), [TypeScript 5.9.3](https://registry.npmjs.org/typescript/5.9.3).
