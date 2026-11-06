# Sprint 1 - Shared Engineering Contract

Version 0.1, 2026-11-06. Proposed common conventions for [#5](https://github.com/Maibokdaimhai/LECTRA/issues/5), alongside the [contract register](README.md) and [Product DoD](product-dod.md). Human team adoption is pending. These conventions coordinate child contracts; they are not a complete F-02-F-05 design/AC/STS or runtime evidence.

## 1. Authority, scope and naming

Instructor outcomes are identified in the [SRS](../../srs.md) and register. Existing LECTRA business rules remain authoritative working scope: F-01-F-05 in S1, identified rating/text surveys, real identity and persistence, Section ownership, frozen publication/eligibility, one immutable response and authorized aggregates/text. Anonymous mode, choice/subset/starter/export/history/notes remain later-sprint work. Numeric limits, exact wire/schema names and IDs below are proposed team details selected to make those rules implementable consistently.

| Object | Convention |
| --- | --- |
| Requirements/features | Preserve FR-xx, BR-xx, NFR-xx, F-01-F-10 and SYS-01-SYS-04. Do not renumber them to match a filename or create a second identity for the same rule. |
| Feature AC | `AC-F01-01`, `AC-F02-01`, etc. Full IDs in authoritative tables; append new IDs, retain changed/retired history. |
| Feature STS | `TEST-F01-U01` unit, `I01` API/DB, `E01` selected UI/E2E, `M01` supplementary/manual/process, `H01` cross-feature handoff; replace F01 for other features. State the level in every STS row. |
| Shared/release criteria | DOD-01-DOD-12 in Product DoD; use a feature AC or named system responsibility for implementation tests, not a new product feature just to number a process check. |
| Cross-feature tests | Allocate a primary owning STS ID and reference other AC/features. An H-case is planned delegated coverage until its actual route/result exists; do not count it as already passed twice. |
| JSON / code / database | camelCase JSON/domain fields, uppercase wire enum values below; database mapping is explicit in the reviewed Prisma/SQL schema. Display labels may say Draft/Published/Closed without changing wire meaning. |
| Artifact status | Draft -> actual reviewed/versioned contract -> implemented/verified -> reviewed/integrated -> released, with real references for each boundary. A filename or checked design row is not an approval. |

Every STS row includes full test ID, linked AC, level, preconditions/fixtures/input, action and expected observable outcome. The actual-result extension records actual source/test file, case name, command/environment, tested SHA, outcome/counts and evidence location when executed. Stable design IDs do not need to equal framework function names; maintain the mapping. Example ID forms are conventions, not real executed tests.

## 2. Protocol and error conventions

### 2.1 Shared transport

One browser origin serves UI and `/api`; local Vite proxies `/api` to Express. Use same-origin credentialed fetch and the F-01 session/Origin/CSRF policy. No client actor/role selector, JWT refresh endpoint, permissive credentialed CORS or second browser API origin is introduced.

Request JSON keys are explicitly allowlisted in each feature's schema; reject unknown identity/privilege keys instead of treating them as authority. Accept application/json with optional UTF-8 charset for JSON writes, no compressed bodies in the S1 profile, JSON objects at the top level, strict type/decoded validation and per-route byte limits. Bytes are measured before JSON parsing, independent of Content-Length claims/chunking. API success is sent only after the authoritative DB commit/save/destroy succeeds. Unexpected errors use a safe generic envelope, never raw SQL/stack/cookie/token/input values.

| Surface | Shared shape or rule |
| --- | --- |
| Single read / successful transition | `{ "data": ... }`; creation/submission 201, reads/transitions 200, successful deletion/logout 204 without a body. Feature contract names the exact object. |
| Paginated list | `{ "data": { "items": [], "pagination": { "limit": 20, "offset": 0, "total": 0 } } }`. Total is the authorized filtered set only, not another owner's or all students' rows. |
| Safe error | `{ "error": { "code": "CODE", "message": "safe text" } }`. Validation may add `fields` with safe field paths/reasons, never echoed input. |
| Field paths | `email`, `title`, `questions[0].prompt`, `answers[0].value`; `_form` for schema/cross-field errors. The feature contract fixes actual paths and messages. |
| Cache | Auth and private data responses use Cache-Control: no-store; no persistent browser cache/storage for identity, drafts/answers or results. Clear private state on logout/detected session loss. |
| Read errors / ambiguous writes | Explicit safe read retry is allowed. After an ambiguous response submission, query own persisted status; do not assert failure or blindly submit again. Resolve auth ambiguity through bootstrap/me as F-01 specifies. |

### 2.2 Identity and rejection order

Use F-01's exact method/Origin/transport/session rules. For protected domain operations: after outer transport/session handling, resolve trusted authentication, then CSRF for unsafe methods, then role, syntactic/domain input validation and owner/eligibility-scoped record access. Wrong role is rejected before exposing record details. A valid-format but missing/out-of-scope record returns the same 404 envelope; a malformed UUID can be 422 after authentication/role without a DB cast error. Feature contracts must specify state/duplicate/domain-validation precedence where two domain failures overlap.

Authentication resolves a request-local immutable actor from the session and trusted User table. Ownership follows Survey -> Lecture -> Section -> owner; sharing a Course grants no permission. A client-supplied ownerId/studentId/userId/role never chooses the actor. Services pass the actor ID into scoped DB predicates and reject inconsistent redundant ownership data. No frontend-only access enforcement.

| Status / shared code | Use |
| --- | --- |
| 400 MALFORMED_JSON | Invalid JSON syntax. |
| 401 AUTH_REQUIRED / SESSION_EXPIRED / INVALID_CREDENTIALS | Missing/unusable/expired session or generic credentials failure; F-01 fixes exact distinctions. |
| 403 ORIGIN_FORBIDDEN / CSRF_INVALID / FORBIDDEN_ROLE | Origin/token violation or authenticated wrong-role operation; no private data. |
| 404 NOT_FOUND | Missing/inaccessible authorized-scope resource, same safe outward shape. |
| 405 METHOD_NOT_ALLOWED | Recognized path unsupported method, Allow header, no side effect. |
| 409 state/uniqueness/revision conflict | Child specifies codes such as SURVEY_STATE_CONFLICT, SURVEY_ALREADY_EXISTS, RESPONSE_ALREADY_SUBMITTED or REVISION_CONFLICT; map actual DB constraints safely. Do not return a success on a rejected duplicate. |
| 413 BODY_TOO_LARGE / 415 UNSUPPORTED_CONTENT | Encoded-byte ceiling or unsupported content type/compression, before persistence. |
| 422 VALIDATION_FAILED | Well-formed schema/type/range/required/ID validation; safe field mapping. |
| 429 LOGIN_RATE_LIMITED | F-01 login bound with Retry-After; no account existence signal. |
| 503 AUTH_SERVICE_UNAVAILABLE / SERVICE_UNAVAILABLE | Known unavailable auth store/DB or domain DB dependency, no memory fallback or false success. |
| 500 INTERNAL_ERROR | Unexpected failure, safe outward envelope and safe diagnostics only. |

These shared codes are proposed names. F-02-F-05 must finalize their exact non-auth state/duplicate/validation statuses and precedence in the child contract. Do not infer a complete error matrix from this short registry. An exception requires a documented reason and impact review across callers/tests.

### 2.3 Lists and IDs

Use `limit` default 20, range 1-100, `offset` default 0, range 0-10,000; nonnegative canonical decimal query syntax with no fractional/negative/NaN values. Invalid values return 422. Apply role/owner/eligibility filtering before count/pagination; child contracts define deterministic order plus ID tiebreaker. Unknown query/filter fields are rejected under the endpoint's exact schema, not silently reinterpreted as F-09 historical search. S1 context selectors and current-work/eligible lists remain F-02; date/state history search is F-09/S3.

Propose server-generated canonical UUIDs (36 ASCII characters with hyphens) for S1 entity identifiers. Clients use only IDs from authorized projections; valid syntax never grants access. #16 and child contracts must agree generation/DB mappings before installation/implementation. Client temporary editor keys cannot become authoritative persisted IDs. Role enums: OWNER/RESPONDENT; survey status: DRAFT/PUBLISHED/CLOSED; S1 mode: IDENTIFIED; question type: RATING/TEXT. No selectable ANONYMOUS/SINGLE_CHOICE path is implemented by naming future baseline concepts.

Dates: server event times are ISO-8601 UTC instants; lectureDate is a calendar date `YYYY-MM-DD`, not a timestamp shifted by browser timezone. F-01 internal security times remain epoch milliseconds with fixed absolute deadlines. No response/bundle per-submission timestamp or participant ordering is added to owner result projections.

## 3. Shared data, validation and request sizing

### 3.1 Data meanings and constraints

| Entity / field family | Shared invariant / owning contract |
| --- | --- |
| User/session | F-01 defines trusted single role, normalized unique email/hash, safe identity, auth_session shape/expiry and cookie/token policy. #16 owns one reviewed User/session migration; #17 configures/runtime-verifies the store. |
| Course/Section/Lecture/Membership | F-02 defines seeded read-only hierarchy and authorized projections. Unique Course code, Section course/term/code, Lecture Section/sequence and membership pair; Section has one owner. Seed/setup is independent of login UI. |
| Survey | One per lecture by DB uniqueness; ownership matches lecture's Section, not merely Course. Draft -> Published -> Closed, no reopen. F-03 defines definitionRevision and all mutation/publication preconditions. |
| Question | Stable server ID, unique survey/position, prompt/type/required; RATING stores min=1/max=5 and endpoint labels/interpretation; TEXT has no rating scale. F-03 defines exact wire/schema mapping and publication validation. |
| SurveyEligibility | Frozen survey/student pair selected from Section membership at publication. F-03 commits snapshot/state together. Later membership edits do not change it. |
| Participation | Unique survey/student pair with eligibility FK. Authoritative own-submission status, not answer-row count; no answer-bundle ID or per-submission timestamp added. |
| ResponseBundle / Answer | F-04 atomic participation/bundle/answers. Identified student association references that survey's eligibility; one identified bundle per survey/student. Composite links keep answer's question/bundle in the same survey; one typed value; rating CHECK 1-5. |
| Results | Derived from committed answers under F-05, not separately editable stored summary. Owner while Published sees count only; Closed identified results follow no-identity comment projection. |

The table coordinates ownership; exact SQL/Prisma types/constraints/delete behavior remain a reviewed #16/feature artifact, never an inferred migration already applied. Expressible local invariants use FK/CHECK/unique constraints; cross-table role/owner/type/completeness invariants use authoritative service/transaction validation with actual tests. Redundant owner IDs must agree with the canonical relation. No client ID equality check substitutes for trusted lookup.

Use Unicode code-point counts for domain text bounds, not UTF-16 code units or encoded-byte counts. Reject invalid types rather than coerce strings to ratings/booleans. Required text rejects whitespace-only input; optional blank text normalizes to no answer. Preserve nonblank response content as plain text; rendering escapes it. Exact title/prompt trimming and Draft-save incomplete-state policy belong to F-03, so publication-only validity is not mistakenly imposed on every temporary editor field.

| Existing/team-selected bound | Required cross-feature interpretation |
| --- | --- |
| Survey title <=120; prompt <=500 code points | Nonblank published values; F-03 states Draft persistence rules and tests 0/1/max/max+1 boundaries. |
| Published survey 1-10 questions, at least one RATING in S1 | Text-only or zero-question publication rejected. SINGLE_CHOICE remains S2; no later feature required to publish S1. |
| Rating integer 1-5 | No default score, numeric-string/boolean/null coercion or missing-optional zero. Persist/display same frozen scale meaning in authoring, answering and results. |
| Text answer <=2,000 code points; at most ten answers | Unknown/duplicate/wrong-survey question IDs and wrong-type values rejected; every required answer valid; at least one nonempty answer even when all optional. |
| Scale labels / interpretation | Proposed labels 1-120 and interpretation 1-500 code points, nonblank after trim; F-03/#16 must adopt consistent columns and tests before code. These new exact label bounds are team proposals, not teacher limits. |

Freeze title/question definitions/order/required flags/scales/mode/eligibility after publication through state-checked writes, not only disabled UI. Definition revisions change on actual Draft-definition edits under F-03's row lock; do not create an unrelated competing revision model in another feature. No submitted-answer edit/withdrawal API or Published/Closed hard delete is added.

### 3.2 BASE-03 common transport proposal for F-04

Adopt the following bounded candidate envelope for #13 to finish, review and test as its exact submit contract:

```json
{
  "answers": [
    { "questionId": "<canonical UUID>", "value": 4 },
    { "questionId": "<canonical UUID>", "value": "A point to explain next time" }
  ]
}
```

Only `answers` at the top level; each item only questionId/value; numeric rating or text string determined by the stored question type. No client type override, student/owner/role ID, null fabricated value or arbitrary metadata. Omit unanswered optional questions; an optional blank text item normalizes to no stored answer. Question IDs are unique and belong to the survey in the authorized path. F-04 defines atomic normalization/validation and the exact 201 confirmation/status/readback shapes; this shared envelope alone does not complete #13.

Set a proposed auth POST ceiling of 8,192 bytes (F-01), survey-definition write ceiling of 262,144 bytes (F-03 to adopt/test), and response submission ceiling of 262,144 bytes (256 KiB). Do not put a smaller global parser limit ahead of those routes. Other state-transition requests use their bounded JSON schema/8 KiB ceiling unless the child contract records a reason. Reject compressed content with 415 in the S1 profile; configure parser inflation accordingly. Decoded limits are enforced independently after parsing; no persistence on 413/415 or invalid content.

Worst-case response sizing: ten 2,000-code-point supplementary-character text values serialized as surrogate-pair JSON escapes occupy 240,000 ASCII bytes. Reserve up to 8,192 bytes for the fixed top/item keys, punctuation, ten bounded UUIDs and ordinary supported envelope formatting; total 248,192 <262,144. This is a conservative transport bound even though an actually publishable S1 survey must include a rating. It does not authorize a ten-text-only survey. Keys/IDs/count remain strictly bounded; arbitrary padding or unusual serializations beyond the byte cap are not promised acceptance. The 8 KiB reserve is a supported fixture/serializer budget, not a custom raw-JSON substring parser requirement.

For survey definitions, ten maximum RATING questions can contain 10 x (500 prompt +120 min label +120 max label +500 interpretation) plus a 120-code-point title. At twelve bytes per escaped supplementary code point, that is 150,240 value bytes; reserve 16,384 bytes for its bounded definition envelope/IDs/other fields, giving 166,624 <262,144. A 64 KiB global authoring limit would not support this worst-case representation. F-03 must finalize the exact create/update envelope and verify the reserve against its supported serializer.

Document-only sizing check during drafting: compact illustrative Python JSON fixtures measured 80,663 UTF-8 / 240,663 surrogate-escaped bytes for the conservative ten-text response envelope, and 51,936 / 152,096 bytes for ten maximum rating definitions with canonical IDs. Both fit the candidate ceiling and envelope reserves. These are serializer-size observations on proposed shapes, not execution against an application parser, accepted F-03/F-04 payloads or domain PASS results.

Under #13, generate the actual maximum UTF-8 and surrogate-escaped fixtures, measure encoded bytes and show the supported maximum reaches parsing/validation without 413; test 262,144/262,145-byte transport boundaries and 2,000/2,001 decoded code-point boundaries independently. Under #12 verify the maximum survey-definition fixture fits its 256 KiB ceiling, including ten prompts/scales. These calculations/proposals are not executed parser tests; child acceptance remains pending actual contract review and later runtime evidence.

### 3.3 BASE-06 frozen scale projection and result definitions

Proposed shared question scale shape is `ratingScale: { min: 1, max: 5, minLabel, maxLabel, interpretation }` for RATING, `ratingScale: null` for TEXT. F-03 maps it to ratingMin/ratingMax/ratingMinLabel/ratingMaxLabel/scaleInterpretation columns; F-04 answering reads and F-05 results return that frozen definition. Same range alone never means higher is better, equivalent wording or comparable metric versions. No S2 metric/template lineage fields are required in S1.

F-05 reports submitted-student responseCount separately from each question's answeredCount. A missing optional answer contributes neither a score nor that question's denominator. Distribution covers score 1 through 5, including zero bins; bin counts sum to answeredCount. Mean is sum/answeredCount, null at zero. Proposed display convention is two decimal places with decimal half-up rounding of the nonnegative rational mean; choose/document API precision and a robust calculation in #14, with a tie fixture such as sum=121/count=40 -> displayed 3.03. Do not infer an overall instructor score or an unlabelled average across questions. This refines the baseline's two-decimal display choice, not an instructor-specified rounding method.

Owner result projections: Published includes only allowed survey metadata and responseCount; Closed identified can include question metadata/numerics and text comments as plain text. Comments exclude user/student IDs, names, avatars, bundle/participation IDs and submission timestamps; no participant list/identity join. Content can itself identify a student, and small identified groups have no promised anonymity threshold. Respondents can retrieve only their own status/identified answers through F-04; owners get no respondent-linked answer endpoint. Every child names an allowlist and tests absent forbidden fields, not merely hiding them in UI.

## 4. Transaction and failure consistency

All domain reads/writes enforce role/ownership/eligibility server-side. Transaction callbacks avoid password hashing, external calls and frontend rendering while holding survey locks. Use one consistent lock order and actual Postgres constraints; do not claim request arrival order defines the outcome.

| Shared race / failure | Required contract ownership and assertions |
| --- | --- |
| Draft edit/delete versus publish | F-03 locks/checks the same Survey row; published definitions cannot mutate after a stale Draft check. Publication validates questions/owner/nonempty members and commits snapshot/state atomically. |
| Two creates for one lecture | F-03 plus #16 unique Survey.lectureId; one succeeds, other safe 409; no duplicate survey or partial definitions. |
| Duplicate submit | F-04 checks state/eligibility under Survey lock, enforces unique participation/identified bundle and atomically commits participation/bundle/answers. Sequential/concurrent duplicate leaves exactly one committed response. |
| Close versus submit | F-03/F-04 same Survey lock: if close commits first, reject submit; if submit commits first, Closed results include it. Use barrier-controlled tests for both orders. |
| Invalid answer or transaction fault | F-04 rolls back every related row; no participation-only completion or success UI. Map expected constraint conflicts safely; unexpected error is failure. |
| Lost submit confirmation | F-04 own-status read discovers actual committed outcome; immutable submitted answers are not resubmitted/edited as a recovery shortcut. |
| Store/session failure or logout/read overlap | F-01 safe failure, no memory fallback; no old-session resurrection after acknowledged logout. This does not cancel an already authorized domain transaction. |
| Result read/restart | F-05 derives from committed authoritative rows; reads do not mutate answer/state; fixture result survives app restart. |

Do not add unconditional transaction retries or silently retry non-idempotent POSTs. Any deadlock/serialization retry policy must be bounded and reviewed in the owning contract; expected uniqueness/state rejection is not a retryable success. #16 coordinates one migration history including custom session SQL; feature leads define invariants; no two competing initial schemas or startup destructive resets. Disposable seed/test cleanup is guarded and separate from development/deployed data.

## 5. Shared UI, privacy and test-design coverage

Use [System SDS section 6](../../system-sds.md) for the existing cool blue/teal light theme, semantic tokens and accessible component states. No new design library, dark-mode toggle or separate role branding is added. Each child provides navigation/fields and loading/empty/validation/busy/401/403/404/5xx states, server-confirmed success, keyboard/focus behavior and 360px/1280px core journey verification. Preserve entered response content on recoverable validation/network error; expiry/logout clears private state and never promises draft recovery. F-01 login passwords are deliberately cleared after completed attempts, so response-form preservation is not a reason to persist passwords.

Display truthful identified-mode disclosure before answering: the answer remains linked to the student in storage; owners see aggregates and unlabelled text after closure, and text may itself reveal identity. Do not call it anonymous, publish per-student participation, add raw-data admin endpoints or automatically send feedback outside the product. F-06's later anonymous collection/privacy decisions remain open; no anonymous toggle is enabled here.

| Risk area / requirement | Minimum planned coverage in owning child/integration work |
| --- | --- |
| FR-01, BR-01/02, NFR-01 | Valid/invalid login; expiry/logout replay; guest 401, wrong role 403, other owner/respondent rejection; identity spoofing; CSRF/Origin. F-01 harness is complemented by real feature routes. |
| FR-02/12, BR-02/03/04/23 | Same-Course/different-owner Sections, hidden Drafts/ineligible surveys, filtered lists/pagination/empty states, safe seed/setup without auth cycle. |
| FR-03/04, BR-04/05/09/10/23 | Draft/publication boundaries, frozen scale readback, nonempty eligibility, one survey per lecture and edit/publish/concurrent creation races. |
| FR-05/06, BR-03/05/06/07/08/10/11, NFR-02 | Required/optional/type/Unicode/byte limits, ineligible/Draft/Closed rejection, duplicate concurrency, whole rollback, close/submit order, own readback after logout/login/restart and ambiguous timeout. |
| FR-07, BR-02/12/13/14/16 | Known-value/no-data/optional-denominator/rounding/bin fixtures, Published count-only, Closed plain-text projection, wrong owner/role, escaping and no-identity fields. |
| NFR-03/05/07/08, SYS-01-04 | Clean setup, actual mapped unit/API-DB/selected E2E tests, meaningful TDD, shared UI states, substantive review/integration and actual release version/results. |

Meaningful TDD targets are expiry/regeneration/revocation and trusted role rules in F-01; scoped discovery in F-02; publication/freeze invariants in F-03; atomic once-only response and close/submit order in F-04; denominator/no-data/projection rules in F-05. Keep actual intended-behavior RED/GREEN versions/results during implementation, not fabricated records produced by this planning document.

## 6. Adoption checklist and dependency handoffs

| Item to resolve before dependent code | Owner / concrete next artifact | Current state |
| --- | --- | --- |
| Product DoD/ID/error/UI conventions | Both #5 owners; review these files and each child alignment | Draft proposed, no human adoption yet. |
| F-01 actual runtime/session cap/schema compatibility | #10/#15/#16/#17; exact installed runtime/lockfile, native hash/store/migration smoke checks | Candidate metadata in F-01 only; no dependency installed or API code executed. |
| F-02 exact list projections/order and context access | #11 with shared pagination/enum/UUID meanings | Pending child contract. |
| F-03 exact authoring/revision/scale schema and max-body fixtures | #12/#16; adopt/update proposal with exact payload/status/transaction tests | Pending child contract. |
| F-04 exact envelope/rejection precedence and confirmation/readback | #13; adopt/update 256 KiB/8 KiB-reserve proposal and test plan | Pending child contract; calculation only, no runtime test. |
| F-05 numeric precision/rounding/projection and chart alternatives | #14; exact allowlist and known-value fixtures | Pending child contract. |
| Preimplementation/task/review versions | Each lead/opposite reviewer; actual publication refs in #5/#10 and PR, accepted review versions when real | Human adoption pending; no fabricated capacity, review, commit, result or release. |

An unresolved child decision prevents implementation of that affected behavior, not all documentation progress. Contract review is a real human task; this AI-assisted consistency work does not supply it. Keep #5 and unaccepted child Issues Open, record justified changes and do not change branch protection/permissions/deployment as a side effect of documenting a convention.
