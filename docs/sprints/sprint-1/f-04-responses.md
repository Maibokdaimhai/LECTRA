# F-04 - Identified Response Submission and Own Retrieval Contract

Version 0.1, 2026-11-07. Proposed under [#13](https://github.com/Maibokdaimhai/LECTRA/issues/13), implementation [#20](https://github.com/Maibokdaimhai/LECTRA/issues/20), shared Part E [#5](https://github.com/Maibokdaimhai/LECTRA/issues/5). Lead Maibokdaimhai; planned opposite-member reviewer R1NNE0. Contract and [STS](f-04-responses-sts.md) are drafts; no response implementation, human approval or executed F-04 tests are claimed.

Baseline staging `090a5288ac57085d7d7107744d976c31ffd8192d`, including merged F-01/shared, [F-02](f-02-context-discovery.md), [F-03](f-03-survey-authoring.md) and [F-05](f-05-results.md). Sources: [SRS](../../srs.md), [shared conventions](shared-contract.md), [Product DoD](product-dod.md). Instructor outcomes are real validated/persistent eligible responses, duplicate/unpublished/Closed rejection, own/cross-user access, preimplementation AC/STS/DoD and actual verification. Exact wire shapes, error precedence, routes and limits below are team designs, not teacher-prescribed protocols.

## 1. Scope, traceability and workflow

Requirements: FR-05/06; BR-01-08/10/11/14; NFR-01/02/05/07; SYS-01/02/03/04. F-03 supplies the published identified questionnaire/disclosure and frozen eligibility; F-01 resolves trusted identity/security; F-02 supplies eligible discovery/own submitted flag; F-05 derives results from committed typed answers. #16 owns one reviewed migration/seed history. No competing questionnaire endpoint or mutable response Draft is introduced.

In scope: eligible RESPONDENT form, strict typed normalization/validation, atomic one-time submit, durable confirmation, read-only own submission/status, ambiguity recovery and backend negative/concurrency/access verification. UI/API/data all require work. No F-04 change to Survey definitions/lifecycle, result calculations or auth lifecycle. Exclude anonymous/choice/subset/export/history/notes, response edit/delete/withdrawal, autosave/local-storage drafts, response lists/other-user lookup, admin UI or deployment.

1. F-02 discovers an eligible Published/Closed survey and own submitted boolean. F-04 loads F-03 GET `/api/surveys/:id` plus its own status, using real identity; no stale list flag authorizes writing.
2. Before answering, show F-03's identified disclosure and frozen question order/type/required/scale. If already submitted, show immutable own answers. If Closed and not submitted, show collection ended without an active form.
3. Collect optional/required inputs; no default rating. Validate locally for feedback, then submit once with F-01 Origin/token and strict JSON. Only committed 201 is success.
4. On ambiguous timeout/disconnect, query own submission status before offering another deliberate send. If committed, show saved answers; if not, preserve in-memory inputs for a deliberate retry while still eligible/Published. No automatic POST replay.
5. Own status/identified answers remain readable after closure, logout/login and app restart using the same PostgreSQL data; later membership changes do not alter the frozen eligibility. Logout/401 clears private local drafts/cache.

## 2. Access, API and projections

F-01 actor `{userId,role}` is authoritative. OWNER calls to respondent-only routes are 403 FORBIDDEN_ROLE before resource lookup. No usable identity is 401 AUTH_REQUIRED, or SESSION_EXPIRED when a loaded session is identifiable at/past deadline. Missing/pruned expired row uses AUTH_REQUIRED. F-04 cannot accept a caller-selected actor from body/query/header.

Scoped resource access requires the authenticated RESPONDENT's SurveyEligibility and Survey state Published/Closed. Missing/ineligible/Draft IDs are the same 404 NOT_FOUND, even if a malformed seed contains Draft eligibility. Current Membership alone grants/revokes nothing. Valid UUID syntax never grants permission. Mode other than IDENTIFIED returns 409 MODE_NOT_SUPPORTED after scoped access/state handling; no anonymous fallback or student-to-anonymous-answer lookup exists.

| Method / route | Exact input | Success / meaning |
| --- | --- | --- |
| POST /api/surveys/:id/responses | Canonical lowercase UUID path; no query keys; exact object with answers array as below; same Origin and valid session-bound CSRF | 201 `{ "data": { "surveyId": "<uuid>", "submitted": true, "answers": [ { "questionId": "<uuid>", "value": 4 } ] } }` after the entire transaction commits. Return only the caller's persisted normalized answers in frozen question-position order. |
| GET /api/surveys/:id/my-submission | Same path format; no body/query; same-origin safe read may omit Origin per F-01 | 200 `{ "data": { "surveyId": "<uuid>", "submitted": false, "answers": null } }` when eligible but no participation. Submitted returns true and the same own answer-array shape as POST, including after Closed. |

The examples are shape illustrations, not actual IDs/results. A response can omit optional questions; do not insert fabricated null/zero answers. Submitted answers array includes only stored answers and stable question IDs; prompts/scales come from frozen F-03 definition. No student/user/owner IDs, bundle/answer/participation IDs, other users, timestamp, session/token or aggregate data in either response. Content is private to this student; explicit allowlist and Cache-Control: no-store on successes/errors. Do not return raw ORM relations.

```json
{
  "answers": [
    { "questionId": "00000000-0000-4000-8000-000000000511", "value": 4 },
    { "questionId": "00000000-0000-4000-8000-000000000512", "value": "Please explain the last example again." }
  ]
}
```

Both routes read own state only; do not add userId/studentId selectors. Unsupported methods on the route family return 405 with Allow POST or GET, after shared Origin/session/applicable unsafe CSRF checks. No PATCH/DELETE response operation. Frontend proposed routes `/surveys/:id/respond` and `/surveys/:id/submission` must be adopted with F-02 navigation before affected code; unimplemented route placeholders do not satisfy these journeys.

## 3. Validation and normalization

Outer JSON is an object with only answers. Each entry has only questionId and value; maximum ten entries, unique canonical question IDs. Extra role/studentId/ownerId/userId/type fields or query keys are rejected rather than ignored. JSON string ratings, booleans, arrays, objects, null, nonfinite/fractional/out-of-range values are never coerced into a score. A JSON number written as 1.0 is the numeric integer 1 after parsing.

| Stored question | Accepted value / normalization |
| --- | --- |
| RATING | Number, integer 1-5; required question must occur. Optional omitted means no answer; no implicit zero or first radio selection. |
| TEXT | String <=2,000 Unicode code points before normalization; reject unpaired UTF-16 surrogates and U+0000 before SQL. Required value must contain non-whitespace content using String.trim() only for the blank check. Preserve the nonblank original text, including surrounding spaces/newlines/composition, for own readback and F-05 comments. |
| Optional blank TEXT | If within input limits but trim() is empty, normalize to no stored answer. An over-limit blank string still violates the decoded limit. Omission is preferred. |
| Unknown/duplicate/wrong-survey question | 422 INVALID_ANSWERS with safe indexed field reason; never reveal another survey's question content/existence. |
| Required and whole-response completeness | Validate every required frozen question; at least one nonempty valid answer after normalization, even if all questions are optional. Empty array or all optional blanks rejected. |

Transport: maximum **262,144 encoded bytes**, no smaller global parser in front of this route, application/json with optional UTF-8 charset, no compressed content. Measure streamed bytes regardless of Content-Length; 262,145 is 413 BODY_TOO_LARGE; unsupported encoding/type is 415 UNSUPPORTED_CONTENT. Byte and decoded limits are independent. Malformed JSON is 400 MALFORMED_JSON. Raw body/validation input is not logged or echoed in errors.

BASE-03 envelope bounds: fixed keys, at most ten 36-character UUIDs, no arbitrary metadata. Ten maximum supplementary-character text strings using surrogate escapes consume 240,000 bytes; an 8,192-byte envelope reserve gives 248,192 <262,144. That is a conservative transport fixture; S1 publication still requires at least one rating, so ten TEXT questions do not become publishable. A maximum valid questionnaire (one rating plus nine 2,000-code-point texts) must also fit UTF-8 and escaped forms. Arbitrary padded/expanded serializations beyond the cap are not promised acceptance. The reserve is a fixture/serializer bound, not a custom raw-JSON substring parser. Runtime boundary tests remain planned.

## 4. Authoritative transaction, concurrency and recovery

After shared perimeter/auth/CSRF/method/role and syntactic path/body validation, begin a short PostgreSQL transaction. Resolve/lock the scoped Survey using `FOR UPDATE OF Survey` with frozen eligibility and non-Draft visibility; do not acquire a broad unscoped foreign Survey lock first. F-03 close and all definition/publication transitions use the same Survey row. No password hashing, external calls or UI rendering inside this transaction.

Under that lock, use this order: scoped access -> PUBLISHED state -> IDENTIFIED mode -> existing Participation -> question/type/required semantic validation -> Participation insert -> identified ResponseBundle insert -> typed Answers insert -> commit. Thus a well-shaped repeated request after Closed returns 409 INVALID_STATE; on an eligible Published survey an already-submitted caller gets 409 RESPONSE_ALREADY_SUBMITTED before semantic answer validation. Syntactically malformed requests may be rejected earlier. Test each isolated case with otherwise valid inputs, plus explicit mixed-invalid precedence cases.

Exactly one transaction may create Participation(surveyId,studentId); DB uniqueness also protects against a missed precheck. A rejected duplicate creates no second bundle/answers and never returns 201. Database uniqueness errors are mapped only for the recognized participation/identified-bundle conflict, not arbitrary SQL errors. Every inserted row commits together or rolls back together, including injected failures after each insert phase.

Close/submit ordering is BR-11: close obtains the row lock and commits first -> waiting submit rejects Closed with no response; submit obtains/commits first -> close subsequently includes it. Arrival time/client timestamps do not decide the winner. Use deterministic barriers and two actual DB connections to prove both orders. No optimistic UI success, in-memory lock or sequential-only test proves this race.

Use bounded DB waits (proposed lock wait 3 seconds) and no automatic retry of non-idempotent POST. Recognized lock timeout/deadlock/serialization/unavailability rolls back where outcome is known, then returns safe 503 SERVICE_UNAVAILABLE; unexpected failure is 500 INTERNAL_ERROR. If commit acknowledgement is lost, do not claim rollback or success from a timeout alone: reconnect and GET own status. The immutable one-submission key prevents a deliberate second attempt from creating another response. Finalize actual Prisma/SQL timeout handling with #16 before code.

GET own status uses a single consistent SQL statement or read-only REPEATABLE READ snapshot for state/eligibility/Participation/bundle/answers. It does not lock the Survey exclusively or modify anything. A read during submission may legitimately show false from the earlier snapshot; recheck after the submit completes. Participation true but absent/mismatched identified bundle, or a bundle without expected participation, is an integrity failure (safe 500), not a false empty answer or exposure of another user. No product repair endpoint is introduced.

## 5. Data contract and migration ownership

#16 authors one additive migration/seed history. F-04 specifies the following constraints/services; no migration or domain schema is implemented by this document or #15 tooling probes.

| Entity / constraint | Required invariant |
| --- | --- |
| SurveyEligibility | PK/unique(surveyId,studentId), Survey/User FKs, frozen after publication. Service verifies eligible account role during publication. |
| Participation | PK(surveyId,studentId), composite FK to SurveyEligibility with RESTRICT for referenced deletion; authoritative own submitted boolean. No bundle ID or per-submission timestamp. |
| ResponseBundle | UUID id PK; surveyId; identifiedStudentId nullable in baseline storage for later modes. In S1 IDENTIFIED service requires the trusted nonnull actor ID before insert; composite FK(surveyId,identifiedStudentId) to eligibility; unique(surveyId,identifiedStudentId), unique(surveyId,id). No precise submission timestamp. |
| Answer | Composite PK/unique(bundleId,questionId); surveyId; ratingValue integer nullable/textValue text nullable. Composite FKs(surveyId,bundleId) and (surveyId,questionId) target matching bundle/question unique pairs. Exactly one typed value; rating CHECK 1-5; text length CHECK <=2,000 characters where supported. |
| Cross-table/type/completeness | Backend transaction checks S1 nonnull identified user, role/eligibility, stored Question.type, same survey, required answers and nonempty normalized response. SQL CHECKs must not query other tables. #16 must explicitly review how mode-aware rules are enforced; nullable storage alone is not privacy or validation. |

No separate response-edit state/table, Participation -> bundle relation or response timestamp is added as an anonymous shortcut. Do not relabel these identified rows anonymous later. Preserve the existing F-03 frozen scale/IDs and F-05 unlabelled text projection; F-04 writes no summary rows. Any later anonymous design is F-06's reviewed schema/privacy work.

Safe fixtures: two owners in distinct Sections of one Course, two eligible respondents, one ineligible respondent, Published/Closed/Draft surveys, required/optional rating/text, known non-BMP and whitespace text, multiple lecture submissions and controlled race fixtures. Use a dedicated allowlisted PostgreSQL test DB; never reset dev/deployed DBs or seed on startup. Real schema/persistence checks wait for #16; the current #15 tooling probe is not evidence for these constraints.

## 6. Exact errors and UI states

Use `{ "error": { "code": "CODE", "message": "safe text" } }`; optional fields use allowed paths such as answers[0].value or _form, never submitted answer values/other-user IDs. Shared error/precedence inheritance is F-01/F-03's reviewed perimeter; F-04's INVALID_ANSWERS/duplicate/state details are proposed coordinated additions under #5.

| Status / code | Condition / persistent effect |
| --- | --- |
| 401 AUTH_REQUIRED / SESSION_EXPIRED | F-01 distinction above; no domain mutation, clear private client content. |
| 403 ORIGIN_FORBIDDEN / CSRF_INVALID / FORBIDDEN_ROLE | Invalid origin/token or OWNER on respondent-only route; no data leak/write. |
| 404 NOT_FOUND | Missing/ineligible/Draft resource with valid path syntax; same outward shape. |
| 405 METHOD_NOT_ALLOWED | Unsupported method after shared checks; Allow header, no write. |
| 409 INVALID_STATE / MODE_NOT_SUPPORTED / RESPONSE_ALREADY_SUBMITTED | State/mode/duplicate in documented order; no partial or second response. |
| 422 INVALID_REQUEST / INVALID_ANSWERS | Syntactic/schema/unknown keys/UUID versus question/type/required/range/Unicode/completeness failure; safe fields. |
| 400 MALFORMED_JSON / 413 BODY_TOO_LARGE / 415 UNSUPPORTED_CONTENT | Transport/parser failure before persistence; no body echo. |
| 503 AUTH_SERVICE_UNAVAILABLE | Shared session/trusted User store unavailable before domain handling; no fallback. |
| 503 SERVICE_UNAVAILABLE / 500 INTERNAL_ERROR | Domain DB/lock failure or unexpected/integrity failure. Known failures roll back; uncertain commit outcome uses own-status recovery rather than fabricated success/rollback. |

UI uses existing cool-theme tokens/light components, single-column form, labelled native rating radios and textarea, required explanation, explicit Clear answer on optional rating, no default score. Show frozen endpoint labels and interpretation; higher is not automatically better. Count Unicode code points; HTML maxlength alone counts UTF-16 units and cannot be the only supported-text validator. Keep nonblank text plain/escaped on own readback, never HTML.

Loading/empty/denied/Closed/submitted/error states are distinct. Disable double-click while request pending; announce progress and show success only after committed API confirmation. On 422 keep entered values, focus an error summary/field links. On recoverable network/server error preserve memory-only inputs and resolve uncertain status; no local/session-storage drafts. On 401/logout clear private fields/cache, return to login and do not promise unsent draft restoration. On a confirmed prior submission show saved immutable answers and no edit/resubmit button. Late responses after logout/account/survey change must not restore stale private content. Selected UI checks cover keyboard/focus and 360px/1280px layouts; no full accessibility-compliance claim.

## 7. Stable acceptance criteria

All cases in the [STS](f-04-responses-sts.md) are Planned / Not run; the #15 tooling checks do not execute these AC.

| ID | Observable outcome | Planned STS IDs |
| --- | --- | --- |
| AC-F04-01 | Eligible Published identified survey renders F-03 frozen definitions/disclosure and current own status, without creating another definition API. | TEST-F04-H01, E01 |
| AC-F04-02 | Required/optional ratings are strict integers 1-5, with no default/coercion/optional zero; missing required rejects. | TEST-F04-U01, I02, I03, E02 |
| AC-F04-03 | Text preserves valid nonblank content, enforces code-point/blank/NUL/surrogate rules and normalizes bounded optional blank to absence. | TEST-F04-U02, I04, E02 |
| AC-F04-04 | Unknown/duplicate/wrong-survey IDs, wrong type and empty normalized response reject without partial persistence. | TEST-F04-U03, U05, I05, I06 |
| AC-F04-05 | 256 KiB byte/compression/parser and decoded limits are independent; supported UTF-8/escaped maximum fits and oversized request writes nothing. | TEST-F04-I07 |
| AC-F04-06 | Actor is server-resolved; guest/wrong-role/spoofed identity cannot submit/read for another account. | TEST-F04-I08, I17 |
| AC-F04-07 | Frozen eligibility controls both endpoints despite later Membership changes; Draft/ineligible/missing remains hidden. | TEST-F04-I09 |
| AC-F04-08 | Closed/non-Published requests never create a response; documented state/duplicate precedence holds. | TEST-F04-I10, I11 |
| AC-F04-09 | Valid POST commits one Participation/bundle/all normalized typed answers and returns only persisted own data in question-position order. | TEST-F04-U06, I01 |
| AC-F04-10 | Sequential repeat returns duplicate conflict without second/changed response. | TEST-F04-I11 |
| AC-F04-11 | Concurrent same-student submit produces exactly one success/committed bundle; loser safely rejected. | TEST-F04-I12 |
| AC-F04-12 | Invalid item or forced failure at each write phase leaves no partial rows or success confirmation. | TEST-F04-I02, I13 |
| AC-F04-13 | Real Survey lock order determines close-first rejection versus submit-first inclusion; no timestamp/arrival shortcut. | TEST-F04-I14, I15, H01 |
| AC-F04-14 | Frozen definitions/required flags/scale are consumed without update; no response edit/delete/reopen operation exists. | TEST-F04-H01, I18 |
| AC-F04-15 | Own false/true status and persisted identified answers survive closure/logout-login/restart; consistent read does not fabricate integrity recovery. | TEST-F04-I16, E01 |
| AC-F04-16 | Other-student lookup, forged query/body identity and owner respondent-linked access are denied without leakage. | TEST-F04-I17, I21 |
| AC-F04-17 | UI pending/confirmation/readonly states reflect real API outcomes; no duplicate UI POST or premature success. | TEST-F04-E01, E02 |
| AC-F04-18 | Ambiguous acknowledgement queries own persisted status before deliberate retry; no automatic response resend. | TEST-F04-I20, E03 |
| AC-F04-19 | Auth/Origin/CSRF/method/schema/state errors match exact codes/precedence with no database/internal/input exposure. | TEST-F04-U04, I10, I18, I20 |
| AC-F04-20 | Private response data is absent from caches/storage/logs/other-user payloads; expiry/logout removes stale client content. | TEST-F04-I21, E04 |
| AC-F04-21 | Reviewed real schema enforces relevant FK/unique/range/typed-column invariants with atomic backend cross-table checks. | TEST-F04-I19 |
| AC-F04-22 | Unsupported mode never stores or reveals an identified/anonymous fallback; no extra student-linked anonymous retrieval. | TEST-F04-I10 |
| AC-F04-23 | F-02 participation flag and F-05 count/denominator/text projections match actual committed normalized rows. | TEST-F04-H02, H03 |
| AC-F04-24 | Accepted contract/STS/DoD, real meaningful RED/GREEN, mapped outcomes, opposite-member review/integration and limitations precede feature Done. | TEST-F04-M02 |
| AC-F04-25 | Core form/readback/errors support labelled keyboard/focus and narrow/wide layouts with truthful identified disclosure. | TEST-F04-E01, E02, E04, M01 |

## 8. DoD, history and coordination gates

Product DoD DOD-01-DOD-10 apply to the implemented feature; DOD-11/12 are integrated release/PDF gates. Before #20, version/review this contract+STS, adopt the proposed F-04 wire/error/normalization/UI-route agreements with #5/#11/#12/#14 and verify applicable #15/#16 plus #17-#19 foundations. A contract-only PR can complete documentation scope without claiming executed app tests; real feature acceptance requires implementation, actual unit/API-real-DB/selected UI results, safe setup, substantive opposite-member review/integration and disclosed gaps.

Meaningful TDD targets: normalized required/completeness rule, atomic rollback/one response under concurrent submission, close/submit lock order and own-user projection. Retain actual intended-behavior RED before correction and GREEN afterward with real test files/names/commands/versions/results; no import-error substitute, weakened assertion or retroactive fabricated commits. Record failure/skip counts, tested implementation SHA/schema/lockfile and safe output when executed. No code or test execution is performed by this specification.

| Agreement before affected code | Owner / actual next artifact |
| --- | --- |
| F-03 definition, eligibility and Survey lock | #12/#13/#16: adopt the same committed frozen IDs/scales/disclosure and FOR UPDATE row ordering; no separate lock authority. |
| F-02 own status/navigation | #11/#13: agree routes and EXISTS Participation meaning; late list/status UI cannot grant access. |
| F-05 data/projection | #13/#14: nonblank original text, absent optional answers, typed rows and no identity-aligned owner arrays; actual H03 when both features run. |
| Shared protocol/error/limits | #5/#10/#13: adopt exact 201/200 payloads, INVALID_ANSWERS/duplicate/state precedence, Unicode/byte/parser policy and safe failures. Existing auth codes unchanged. |
| Schema/native timeout/read consistency | #16/#13: review composite keys/FKs, nullable storage versus S1 service invariant, constraints, indexes, wait/fault mapping and real Postgres fixtures before writing migrations/services. |
| Human acceptance/evidence | Actual opposite-member review and accepted source versions pending. Existing #15 smoke results cannot fill these F-04 result fields. |

These unresolved agreements block their dependent code, not contract drafting or bounded tooling setup. Update shared register/traceability after actual review; do not mark #5 or #20 complete from this draft.
