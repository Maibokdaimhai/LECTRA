# F-03 — Survey Authoring, Publication and Closing

Version 0.2 · 2026-11-07 · Issue #12 · Sprint 1 · **Proposed engineering contract; not implemented or accepted.**

## 1. Purpose, authority and scope

Specify F-03 before application implementation: an Owner selects an owned Lecture, creates/edits/deletes its Draft, publishes a complete identified survey, and closes it. Respondents can read only eligible Published/Closed definitions. This document specifies intended behavior, not evidence that it exists. All cases in the [STS](f-03-survey-authoring-sts.md) are Planned / Not run.

Authority: [SRS](../../srs.md) §§2–7, [Feature Inventory](../../features.md), [Traceability](../../traceability.md), [System SDS](../../system-sds.md) §§2–6,11,13–15, [decisions](../../decisions.md), [Sprint Plan](../plan.md), [tracker](tracker.md) §§2–4 and [workflow](workflow.md) §§3–8. The supplied Issue #12 task is the issue-scope source; the remote Issue page could not be retrieved. Instructor deliverable expectations require preimplementation feature UI/API/data design, observable AC and planned unit/integration/E2E specifications; implementation, executed evidence and teammate acceptance remain later gates.

The updated staging baseline supplies local [shared conventions](shared-contract.md), [F-01](f-01-authentication.md), [Product DoD](product-dod.md), [contract register](README.md) and [F-02](f-02-context-discovery.md). F-03 follows their authentication/transport definitions and the Tracker's phased Issue #16 policy; it no longer depends on the earlier PR #29 proposal snapshot. F-04/F-05 feature contracts remain separate dependencies. Resolve F-03-specific schema/interface agreements in §11 before dependent implementation; the presence of these documents is not implementation, executed verification or acceptance of this F-03 contract.

| Requirement | F-03 obligation / boundary | Acceptance criteria |
| --- | --- | --- |
| FR-03 | Owned Lecture Draft creation, ordered RATING/TEXT authoring, partial Drafts, deletion | AC-F03-01–10,22–25 |
| FR-04 | Valid publication and closing; UI reflects committed state | AC-F03-08,11–20,22–23 |
| BR-02 | Backend role, canonical ownership and safe projections | AC-F03-02,04,21 |
| BR-03 | Frozen eligibility from one publication snapshot; later membership changes do not alter it | AC-F03-12–16 |
| BR-04 | DRAFT → PUBLISHED → CLOSED; Respondents cannot discover Drafts | AC-F03-04,11,17–18 |
| BR-05 | Nonblank title, 1–10 valid questions, at least one RATING in S1, nonempty eligibility | AC-F03-06–08,12–13 |
| BR-07 | Freeze required/type/rating meaning and stable question IDs for F-04 validation; F-04 owns answer validation | AC-F03-05,07,14,26 |
| BR-09 | No post-publication edits of definition, order, required flags, mode or eligibility | AC-F03-11,14–15 |
| BR-10 | Only Draft deletion; no response editing/deletion or hard deletion of Published/Closed surveys | AC-F03-10–11,17 |
| BR-11 | Close uses the same Survey transaction lock as F-04 submit | AC-F03-19–20,26 |
| BR-14 | IDENTIFIED only and truthful account-link disclosure before answering | AC-F03-04,14,26 |
| BR-23 | Canonical Section ownership; database-enforced one survey per Lecture, including races | AC-F03-02–03 |
| NFR-01 | Authenticated, scoped operations; safe errors, sessions and projections | AC-F03-02,04,21 |
| NFR-02 | Real database transactions, rollback, restart persistence; F-04 handoff | AC-F03-15–20,25–26 |
| NFR-05 | Bidirectional AC/STS, meaningful unit/real PostgreSQL/selected E2E and genuine later results | AC-F03-26 and all mapped cases |
| NFR-07 | Keyboard, labels, visible feedback at 360px and 1280px | AC-F03-22–24 |

BR-05 also permits SINGLE_CHOICE in the whole product; it is Sprint 2 and is rejected here. Excluded: starter questionnaires, copies/reuse, provenance/metric management, anonymous mode, enrollment/academic-context administration, response submission, results calculations, history filters, improvement notes, export, CI and deployment. F-03 must not make any of them prerequisites for S1 publication.

## 2. Actors, ownership and visibility

The authenticated F-01 session supplies the trusted User ID and single role; request headers/body cannot select an actor. OWNER and RESPONDENT are separate roles, not a combined privilege. Canonical ownership is `Survey → Lecture → Section.ownerId = session.userId`; on create it is `Lecture → Section.ownerId`. A shared Course never grants another Section's permissions. Redundant `Survey.ownerId` is server-derived and must match the Section owner. Ownership transfer is outside scope.

| Operation | OWNER | RESPONDENT | Unauthenticated |
| --- | --- | --- | --- |
| Create for Lecture | Owned Lecture only | 403 | 401 |
| Read definition | Own Draft/Published/Closed only | Published/Closed AND frozen SurveyEligibility only | 401 |
| Save/delete Draft | Own Draft only, matching revision | 403 | 401 |
| Publish | Own Draft, matching revision and complete validation | 403 | 401 |
| Close | Own Published only | 403 | 401 |

Missing/inaccessible Lecture or Survey returns the same 404 envelope; do not distinguish another owner's resource. Respondent Draft/ineligible reads are 404, even with guessed IDs, current Section membership, or participation elsewhere. Eligible Respondents retain Published/Closed read access after membership removal; later enrollment alone does not grant it. F-02 owns discovery and own-participation status. F-03 returns definitions, never answers, participant lists, participation flags, aggregate results or counts.

## 3. Functional workflows and lifecycle

1. F-02 supplies an owned Lecture ID and existing-survey navigation. POST creates an empty Draft (title `""`, questions `[]`, revision 1, mode IDENTIFIED); no valid questionnaire is required yet. The unique Lecture association is checked by PostgreSQL, not a discovery flag.
2. Owner loads the definition and edits title/questions locally. Save replaces the complete Draft definition atomically, retaining IDs for existing questions. Array order becomes positions 1…n. Save confirmation uses the server response only.
3. Owner saves before requesting publication. Publish confirms that the saved definition will be frozen and the selected Section's members at the publication snapshot will become eligible. Server rechecks ownership, revision, full definition and eligibility inside the publication transaction.
4. Published owner view is read-only except Close. Eligible Respondents obtain the frozen questionnaire/disclosure for F-04. Close confirmation changes state only after server commit. Closed owner view remains read-only; F-05 owns results navigation and presentation.
5. Draft deletion requires confirmation and the loaded revision. A successful 204 releases the Lecture association; a later new Draft has new Survey/question IDs. Published/Closed records cannot be deleted.

| Current state | Save definition / delete | Publish | Close | Respondent definition |
| --- | --- | --- | --- | --- |
| DRAFT | Allowed with expectedRevision | Allowed only if complete and eligible | 409 INVALID_STATE | 404 |
| PUBLISHED | 409 INVALID_STATE | 409 INVALID_STATE | Allowed | 200 if frozen-eligible |
| CLOSED | 409 INVALID_STATE | 409 INVALID_STATE | 409 INVALID_STATE | 200 if frozen-eligible |

There is no reopening or reverse transition. Repeated publish/close is a 409, not a second successful transition. Neither transition changes `definitionRevision`; it identifies the last saved definition. `publishedAt` is set once on publication and retained; `closedAt` is set once on closing. Both are server UTC timestamps, null before the corresponding transition. Ordering is defined by locks/commits, not browser or timestamp comparison.

## 4. Validation and definition representation

These are proposed exact F-03 interface choices, consistent with the baseline limits. Validate server-side; UI feedback is supplementary. JSON property names are case-sensitive; reject unknown keys and implicit coercions. IDs use canonical lowercase UUID strings, enums use uppercase values. No ownerId, status, mode, positions, timestamps or eligibility fields are client-writable.

Trim leading/trailing Unicode whitespace from title, prompt, labels and interpretation using the JavaScript `String.trim()` semantics before validation/storage. Count Unicode code points of the resulting string, not UTF-16 code units or bytes; do not normalize case or Unicode composition. Reject unpaired UTF-16 surrogates and U+0000 with 422 INVALID_DEFINITION (PostgreSQL text cannot store NUL). Internal whitespace is retained. The limits below apply to stored normalized strings; transport byte limits apply to raw requests independently.

| Field / rule | Draft save | Publication |
| --- | --- | --- |
| title | String, 0–120 code points | 1–120, nonblank |
| questions | Array, 0–10 entries | 1–10 entries, at least one RATING |
| prompt | String, 0–500 code points | 1–500, nonblank |
| type | Exactly RATING or TEXT | Same |
| required | Strict boolean, per question | Same, frozen; all may be optional |
| RATING ratingScale | Exact object: min 1, max 5 (integers), minLabel/maxLabel strings 0–120 each, interpretation string 0–500 | Same numeric range; both labels and interpretation nonblank |
| TEXT ratingScale | Exactly null; rating metadata not accepted | Same |
| Question identity | id is existing owned-Draft UUID or null for a new question; no duplicate IDs | Server-assigned IDs persist unchanged |

Label/interpretation length limits and normalization are F-03/shared-agreement proposals, not newly attributed instructor requirements. A Draft can be empty, text-only, or contain blank content, but cannot contain malformed types/scales or over-limit fields. F-04 must use the published required flags, stable IDs and frozen scale: integer rating 1–5; text ≤2,000 code points; required text non-whitespace; reject unknown/duplicate/wrong-survey IDs, wrong types and an entirely empty response even if every question is optional (BR-07). F-03 does not implement those submission rules.

PATCH is whole-definition replacement, not JSON Patch: every item supplies all fields below. Retained IDs stay stable through text/type edits and reordering. Omitted existing IDs are removed; null IDs receive server UUIDs. Unknown, foreign-survey and repeated IDs return generic field validation without revealing existence. Positions are server-derived, unique and contiguous. No revision history table or separate question-write API is needed.

```json
{
  "expectedRevision": 1,
  "title": "Lecture feedback",
  "questions": [
    {
      "id": null,
      "prompt": "How fast was the lecture?",
      "type": "RATING",
      "required": true,
      "ratingScale": {
        "min": 1,
        "max": 5,
        "minLabel": "Very slow",
        "maxLabel": "Very fast",
        "interpretation": "Higher means faster, not necessarily better."
      }
    },
    {"id": null, "prompt": "Suggestions", "type": "TEXT", "required": false, "ratingScale": null}
  ]
}
```

`expectedRevision` is a positive safe integer. Every real saved definition change increments revision exactly once; normalized no-op saves return the same revision. A stale no-op still conflicts. Two saves with new null-ID questions are changes, not no-ops. Publish/delete require the current revision too; Close does not because the definition is already frozen. Revision conflicts never silently overwrite data.

## 5. API contract

### 5.1 Six endpoints

All paths include `/api`; UUID path parameters only, no query parameters on these endpoints. Shared F-02 `GET /api/surveys` remains a separate discovery handler. No duplicate listing or response APIs are introduced. Success with a representation uses `{ "data": <definition> }`; DELETE has no body.

| Method / path | Actor and scope | Exact request JSON / raw byte ceiling | Success | State / revision / transaction |
| --- | --- | --- | --- | --- |
| POST /api/surveys | OWNER; Lecture belongs to own Section | `{ "lectureId": "<uuid>" }`; 8 KiB | 201 owner definition; Location `/api/surveys/<id>` | New Draft revision 1; creation transaction and unique lectureId |
| GET /api/surveys/:id | OWNER own Survey; RESPONDENT frozen-eligible Published/Closed | No body or query | 200 role projection | Consistent read snapshot; no mutation |
| PATCH /api/surveys/:id | OWNER own Survey | Whole-definition object in §4; 256 KiB | 200 owner definition | Draft, matching expectedRevision; row-locked atomic replacement |
| DELETE /api/surveys/:id | OWNER own Survey | `{ "expectedRevision": 1 }`; 8 KiB | 204, empty | Draft, matching revision; row-locked deletion |
| POST /api/surveys/:id/publish | OWNER own Survey | `{ "expectedRevision": 1 }`; 8 KiB | 200 owner definition | Draft, matching revision, full validation and nonempty eligibility; row-locked transaction |
| POST /api/surveys/:id/close | OWNER own Survey | `{}`; 8 KiB | 200 owner definition | Published; same Survey lock as submission; no revision input |

All mutation bodies are required JSON objects, including Close. DELETE JSON support must be verified in client/parser integration. Protected GET rejects a body or query with 422 INVALID_REQUEST. Unsupported methods on a recognized route return 405 with the route family's Allow header, after Origin, transport, session and applicable unsafe-method CSRF checks; an unsupported method must not bypass authentication or become a write. Route-family method handling must retain F-02's collection GET. Allow is GET/POST for the collection, GET/PATCH/DELETE for a definition, and POST for each transition (serialize as comma-separated method names).

### 5.2 Role projections

Owner definition contains only `id, lectureId, title, status, mode, definitionRevision, publishedAt, closedAt, context, questions, privacyDisclosure`. Respondent definition contains only `id, lectureId, title, status, mode, context, questions, privacyDisclosure`. Definition revision/timestamps are management metadata and not required for submission. Every question is `{id, position, prompt, type, required, ratingScale}`; TEXT scale is null, RATING scale is the §4 object. Return questions in ascending position, never database natural order. There is no pagination on a bounded single definition (maximum ten questions).

Proposed safe context matches the prior F-02 draft shape: `course:{id,code,title}`, `section:{id,courseId,term,sectionCode}`, `lecture:{id,title,lectureDate,sequence}`. IDs are UUID strings, code/title/term/sectionCode are strings, sequence and question positions are positive integers. Per SDS §2, lectureDate is a local calendar date, serialized here as `YYYY-MM-DD` without timezone conversion; confirm that exact representation with #11/#16. publishedAt/closedAt serialize as ISO 8601 UTC strings with a Z suffix or null. IDs and display metadata describe the survey, not membership. Explicit serializer allowlists omit ownerId, studentId, Membership/Eligibility lists, auth/session fields, provenance, participation and response data. Do not return raw ORM rows.

`mode` is always IDENTIFIED. Proposed disclosure text: “This survey is identified. Your answers remain linked to your account in storage. The survey owner sees summaries and unlabelled written feedback after closing, without your account identifier. Your written content may still identify you. Small groups can also make summaries identifiable.” F-04 must display this before answering; it must not describe the mode as anonymous or promise that text or aggregates cannot identify someone. F-05 separately provides the baseline's Published response count and Closed results. F-03 does not expose either.

Example 201 creation body (synthetic IDs/context, no stored participants). GET/PATCH/publish/close use the same owner envelope with the committed state/definition; the Respondent GET removes definitionRevision/publishedAt/closedAt and otherwise follows its allowlist above:

```json
{
  "data": {
    "id": "00000000-0000-4000-8000-000000000101",
    "lectureId": "00000000-0000-4000-8000-000000000102",
    "title": "",
    "status": "DRAFT",
    "mode": "IDENTIFIED",
    "definitionRevision": 1,
    "publishedAt": null,
    "closedAt": null,
    "context": {
      "course": {"id": "00000000-0000-4000-8000-000000000103", "code": "CPE334", "title": "Software Engineering"},
      "section": {"id": "00000000-0000-4000-8000-000000000104", "courseId": "00000000-0000-4000-8000-000000000103", "term": "Demo term", "sectionCode": "A"},
      "lecture": {"id": "00000000-0000-4000-8000-000000000102", "title": "Demo lecture", "lectureDate": "2026-11-07", "sequence": 1}
    },
    "questions": [],
    "privacyDisclosure": "This survey is identified. Your answers remain linked to your account in storage. The survey owner sees summaries and unlabelled written feedback after closing, without your account identifier. Your written content may still identify you. Small groups can also make summaries identifiable."
  }
}
```

Every protected success/error response uses `Cache-Control: no-store`. Safe validation fields name allowed paths (for example `questions[0].prompt`), never submitted text, account identifiers or database diagnostics.

### 5.3 Security perimeter, errors and precedence

Consume F-01's trusted session and shared middleware, including absolute session expiry, regenerated login session and logout invalidation; F-03 neither creates sessions nor extends expiry. Follow the staging shared/F-01 convention: same-origin cookies; reject explicit foreign or `null` Origin on every protected route, require exact configured Origin plus session synchronizer CSRF token on unsafe methods, and allow omitted Origin on a safe same-origin GET. Missing/invalid CSRF is 403 CSRF_INVALID. No permissive CORS override or reliance on disabled UI controls.

Order: (1) shared Origin/transport perimeter, (2) session authentication, (3) unsafe-method CSRF, (4) route method then role, (5) syntactic path/body validation, (6) ownership/eligibility-scoped resource lookup, then (7) locked state, expectedRevision, semantic definition, eligibility in that order. Transport errors can precede authentication; malformed JSON cannot be interpreted as a business operation. Known field types/lengths are checked in step 5; nonblank publishability and related-row question identity are step 7. Thus a valid-shaped edit of a Published survey is 409, while malformed JSON is 400, and a wrong-role well-formed request is 403 before record lookup. An inaccessible record with valid syntax is always 404. Tests use otherwise valid requests to isolate each boundary.

| HTTP / code | Trigger / applicable endpoints | Persistent effect |
| --- | --- | --- |
| 400 MALFORMED_JSON | JSON parse failure on a JSON body | None |
| 401 AUTH_REQUIRED | Missing, forged, revoked or invalid-state session, missing/invalid User, or expired session whose row is missing/pruned; all six routes | None; follow F-01 private-state cleanup |
| 401 SESSION_EXPIRED | Server identifies a loaded authenticated session at/past its absolute deadline; missing/pruned expiry instead uses AUTH_REQUIRED | None; same F-01 private-state cleanup |
| 403 ORIGIN_FORBIDDEN / CSRF_INVALID / FORBIDDEN_ROLE | Shared Origin/CSRF checks; authenticated Respondent management | None |
| 404 NOT_FOUND | Missing or inaccessible scoped Lecture/Survey; Respondent Draft/ineligible read | None; identical safe message |
| 405 METHOD_NOT_ALLOWED | Unsupported method for a recognized route | None; Allow header |
| 409 SURVEY_ALREADY_EXISTS | Create collides on Survey.lectureId, including race | No second Survey |
| 409 INVALID_STATE | Valid-shaped save/delete/publish/close in a forbidden state | None |
| 409 REVISION_CONFLICT | Draft save/delete/publish expectedRevision is stale | None; GET to reconcile |
| 422 INVALID_REQUEST / INVALID_DEFINITION | Bad UUID/schema, extra keys, question IDs, field limits, scale/type or publishability | None; safe fields where applicable |
| 422 ELIGIBILITY_EMPTY / ELIGIBILITY_INVALID | Publication snapshot empty or contains invalid non-Respondent membership | No partial snapshot/transition; no identities in error |
| 413 BODY_TOO_LARGE | More than endpoint's raw byte ceiling | None |
| 415 UNSUPPORTED_CONTENT | Mutation not application/json (optional UTF-8 charset), or non-identity Content-Encoding | None |
| 503 AUTH_SERVICE_UNAVAILABLE | F-01 session-store or trusted User lookup unavailable before domain handling | No domain mutation; no authentication fallback |
| 503 SERVICE_UNAVAILABLE / 500 INTERNAL_ERROR | Known database unavailability / unexpected failure | Known failed transaction rolls back; uncertain commit outcome reconciled by GET/discovery (§7), never blindly retried |

Error shape: `{ "error": { "code": "REVISION_CONFLICT", "message": "The survey changed. Reload before trying again." } }`; optional `fields` maps allowed field paths to safe fixed messages. Do not include revision/current record details on 404, SQL, stack traces, tokens or answer content. Logs use operation/correlation ID and safe error class, not request bodies or session secrets. Map only the expected uniqueness constraint to SURVEY_ALREADY_EXISTS; other database faults are not validation errors.

A byte is not a code point. Set per-route parser ceilings, rejecting >8,192 or >262,144 bytes; exact ceilings are permitted if the JSON is otherwise valid. Measure actual streamed bytes even without Content-Length; reject compressed bodies rather than decompressing unbounded input. A smaller global parser must not reject an otherwise permitted authoring request. Worst-case escaped content for ten RATING questions is `(120 + 10 × (500 + 120 + 120 + 500)) × 12 = 150,240` bytes plus bounded keys/IDs/envelope (under 16 KiB), below 256 KiB. Test real boundary fixtures and high-code-point content; a published-valid survey must fit. The app proxy must not silently impose a smaller limit. These exact limits/error names remain shared-convention agreements (§11).

## 6. Data responsibilities — handoff to Issue #16

Issue #16 (SYS-01) owns Prisma schema, migrations, indexes, seed roles and DB constraints. Issue #12 specifies invariants; implementation Issue #19 owns F-03 service/UI behavior. No migration is part of this issue. Use the accepted stack (React/Vite, Express/Zod, Prisma/PostgreSQL); exact versions remain the baseline's OPEN-02 gate.

| Entity / relation | Required invariant / proposed constraint | Service responsibility |
| --- | --- | --- |
| Section → Course, Owner | PK; Course/User FKs; index Section.ownerId; Owner role consistent | All permissions derive from Section.ownerId; no co-teaching/ownership transfer |
| Lecture → Section | PK; Section FK; index Lecture.sectionId and discovery order fields | Look up through owned Section on creation; cannot reparent in F-03 |
| Survey → Lecture | PK UUID; NOT NULL unique lectureId FK; ownerId FK; status/mode enums; positive definitionRevision | Derive ownerId; IDENTIFIED only S1; enforce lifecycle/field immutability under lock |
| Question → Survey | PK UUID; surveyId FK; positive integer position; unique (surveyId,position); index covered by unique key | Contiguous final 1…n, n ≤10; stable IDs; whole replacement under Survey lock |
| Question meaning | Prompt/type/required; ratingMin/Max, endpoint labels, scaleInterpretation | Map ratingScale to named SDS columns; TEXT rating columns null; RATING 1/5; draft blank vs publish nonblank |
| Membership → Section, User | Unique (sectionId,studentId); FKs; Section-leading key | #16 seed validates RESPONDENT roles; publication validates selected rows again |
| SurveyEligibility → Survey, User | Unique (surveyId,studentId); FKs to Survey/User, not live Membership | Insert frozen publication set once; never derive eligibility anew on read |
| Participation / ResponseBundle / Answer | Existing SDS keys/eligibility links; Answer.questionId FK prevents deleting referenced definitions | F-04 owns writes; F-03 closing preserves all rows; published deletion impossible |

Database and application validations complement each other. Timestamp/state coherence and rating type constraints belong in #16's reviewed schema; nonblank/1–10/cross-table membership requirements are transaction/service checks unless an agreed DB constraint also enforces them. Redundant owner consistency requires a reviewed invariant/seed check; a plain ownerId FK alone does not prove Section ownership.

To reorder with a nondeferrable unique (surveyId,position), while holding the Survey lock stage all existing positions by +10 (11…20), delete omitted rows, then update retained/insert new rows to final 1…n in the same transaction. The DB position CHECK must be positive, not ≤10, to allow staging; the service enforces final bounds. No reader sees intermediate positions; a failure rolls back the complete operation. Do not delete/recreate retained Question IDs to avoid ordering collisions. Issue #16 must accept this strategy or agree and test an equivalent atomic strategy before migrations.

Draft deletion removes only its Questions and Survey in one transaction. Never configure a blanket application delete path that cascades through submitted responses. Use restrictive Answer/response FKs as defense in depth. Source/provenance and single-choice tables are not prerequisites for this S1 schema subset.

## 7. Transactions and concurrency

Use real PostgreSQL transactions. All F-03 definition writes, Draft deletion, publish, close and F-04 submit serialize on the **same Survey row**, using a parameterized `SELECT … FOR UPDATE` or proven equivalent. Acquire the lock before inspecting mutable state/revision or writing dependent rows, recheck canonical ownership, and hold it until commit/rollback. Prisma read/update without that database lock is insufficient. Lock order for existing surveys is Survey then dependent rows. No external/network calls inside the transaction; construct the success projection from that transaction's result and return it only after commit, without an unlocked requery that could return a later writer's definition. Known transient faults may be retried only through reviewed policy, never blind client mutation retries.

| Operation / race | Authoritative outcome |
| --- | --- |
| Create / create | No Survey row exists to lock. Resolve owned Lecture and insert server-derived Draft in a transaction; unique Survey.lectureId yields exactly one 201 and one 409 for concurrent successful competing inserts. A rollback permits the other creation. |
| Save / save | Lock, verify Draft then expectedRevision, validate question identities and write atomically. Two real changes using the same revision produce one 200/revision+1 and one 409 REVISION_CONFLICT; no merged fields. No-op retains revision only after matching expectedRevision. |
| Save / publish | Both require the displayed revision and same lock. Save first: revision changes, publish is stale 409. Publish first: freezes definition, save is 409 INVALID_STATE. No partly saved published definition. |
| Delete / other Draft mutation | Same lock and revision; committed deletion makes the other operation 404; a prior changed revision makes deletion 409. No orphan questions or bypass via guessed question IDs. |
| Publish | Lock Draft, check revision, validate whole definition, obtain membership snapshot as below, insert all Eligibility rows and set PUBLISHED/publishedAt in one transaction. Readers see either the original Draft with no snapshot or the committed frozen state with the complete snapshot. |
| Membership / publish | After acquiring Survey lock, use **one authoritative SQL SELECT statement** to materialize Section Membership plus User role at PostgreSQL READ COMMITTED statement snapshot. This set is the eligibility boundary. Commits visible before that statement are included; additions/removals committed after its snapshot do not alter the set, even if they precede publication commit. Uncommitted changes are invisible. Validate all selected users are Respondents and set nonempty; do not count first then requery a different set. |
| Close / submit | Both take Survey lock before state checks. If Close commits first, submit sees CLOSED and rejects with no participation/bundle/answers. If submit commits first, its complete response remains when Close commits. A rolled-back Close does not close; a rolled-back submit adds no response. F-03 never writes a response on behalf of F-04. |
| Publish / publish; close / close | First valid committed transition wins (200); second acquires lock, sees changed state and returns 409 INVALID_STATE. Original timestamps/definition/eligibility are not rewritten. |
| Publish / close | Starting from Draft: if Close locks first it rejects 409 INVALID_STATE, then publication may succeed and leave Published. If publication commits first, waiting Close observes Published and may commit Closed. There is no queued intent to close a Draft later; the state under lock decides each operation. |
| Any write fault | Roll back Survey, Questions, staged positions, Eligibility and timestamps together as applicable. Fault before/during commit must not produce success. If commit acknowledgment is lost, treat client outcome as uncertain and reconcile by GET/discovery; never claim rollback without knowing it occurred. |

S1 membership changes are seed/setup operations, not an enrollment API. Publication's defined snapshot avoids requiring a nonexistent membership-writer locking protocol. Eligibility references User, not Membership, so later membership removal does not delete it. User deletion/role changes are outside the S1 application scope; #16 seeds and test setup must preserve published eligibility. If future membership workflows require a different snapshot boundary, coordinate the baseline/F-02/F-04 contracts first.

GET definition uses a read-only REPEATABLE READ transaction snapshot for parent/context/questions so a concurrent save cannot produce a mixed revision/title/question set; a single SQL statement producing the complete scoped representation is an equivalent option. Multiple READ COMMITTED queries alone are not sufficient. GET does not mutate or take the exclusive Survey lock. A read just before publication/closing can legitimately show the earlier state; the next request observes committed changes. PostgreSQL [row locking](https://www.postgresql.org/docs/current/explicit-locking.html) and [statement/transaction snapshots](https://www.postgresql.org/docs/current/transaction-iso.html) describe the database mechanisms, not executed project evidence.

## 8. UI contract

Proposed routes: F-02 owned Lecture action opens `/surveys/:id/manage` after create, existing-survey action opens the same management view; eligible Respondent action opens `/surveys/:id` for F-04's answer journey. Confirm route names with #11/#13 rather than introduce duplicate discovery pages. All protected screens use the SDS §6.1 visual/accessibility patterns and F-01 session handling.

| View / condition | Required behavior |
| --- | --- |
| Create | Selected Lecture/Course/Section context visible; explicit Create Draft action; disable repeated action while pending. Existing-survey conflict refreshes F-02 discovery and opens the owned existing survey only after scoped retrieval. |
| Draft editor | Labelled title, question prompt/type/required controls; RATING fixed 1–5 plus editable endpoint labels and interpretation; TEXT has no scale controls. Add/remove and keyboard Up/Down reorder; stable local keys until server IDs return. Empty Draft explains how to add questions; max ten enforced with server validation authoritative. |
| Save | Display unsaved state and loaded revision. Save allows incomplete valid-shaped Drafts; field limits/type errors shown next to controls and in a focusable summary. Replace local IDs/revision with confirmed server representation; never display Saved during a pending/failed request. |
| Publish | Require saved local state and review of persisted questions/scale/privacy; show confirmation of immutability and Section-member snapshot boundary. Blank/invalid draft remains saveable but not publishable. Server eligibility/validation errors retain recoverable editor values; do not invent a preview count endpoint or claim all current members remain eligible later. |
| Published / Closed | Definition read-only, Draft save/delete hidden; Close only while Published, with confirmation and pending state. Closed shows persisted status, no reopen. F-05 results are a separate handoff, not fabricated F-03 results. |
| Respondent | Display frozen questionnaire/identified disclosure for eligible Published/Closed read; Draft/ineligible/missing shows unavailable without private metadata. F-04 owns answer inputs, submission state and confirmation; Closed cannot enable submit. |
| Conflict | On 409 revision conflict retain unsaved values in memory and explain Reload then manually reapply to current question IDs/revision; no automatic overwrite/retry. On state conflict reload read-only committed definition and clearly mark unsaved changes as not stored. |
| Network / failure | Keep recoverable values, show actionable retry/reconcile message. An uncertain create uses owned-Lecture discovery; uncertain save/publish/close uses GET before retry. For uncertain delete, 404 means unavailable, not proof of this user's deletion. Never show mutation success before confirmation. |
| Authentication / navigation | On 401 clear private loaded/unsaved data per F-01 and return to login; do not promise draft recovery after session loss. Warn before leaving unsaved editor; no localStorage persistence of private definitions. 404 removes inaccessible resource details. |
| Loading / accessibility | Distinct loading/empty/error states; prevent duplicate pending actions without removing keyboard access to errors. Native labelled controls, visible focus, error-summary links, dialog focus return and meaningful reorder/remove focus. Test at 360px/1280px without horizontal form overflow. |

The identified disclosure is truthful about storage; hiding names is not anonymity. Owner previews show the same interpretation/endpoint labels that Respondents and F-05 will use; higher values must not be labelled “better” unless that is what the explicit scale means.

## 9. Acceptance criteria and bidirectional traceability

All criteria below are proposed, observable acceptance targets, not satisfied results. Each TEST ID is expanded in the STS; that document also maps every case back here.

| AC ID | Required observable outcome | Planned TEST-F03 cases |
| --- | --- | --- |
| AC-F03-01 | Creating on an owned empty Lecture returns 201 empty IDENTIFIED Draft revision 1, canonical owner and committed definition retrievable by GET. | I01 |
| AC-F03-02 | All six routes enforce §2 server-side; foreign-owner records are 404, Respondent management 403, unauthenticated access 401, with no mutation or private data. | I02,I23 |
| AC-F03-03 | Concurrent creates for one Lecture yield exactly one Survey; committed winner 201 and conflicting loser 409. | I03 |
| AC-F03-04 | Owner reads own three states; Respondent reads only frozen-eligible Published/Closed, never Draft. Projections, question order and disclosure match §5.2; no participant/answer/owner-identity leak. | U06,I04,I24,E04 |
| AC-F03-05 | Save atomically adds/edits/removes/reorders questions with retained stable IDs and contiguous positions; invalid/foreign/duplicate IDs cause 422 and no change. | U05,I05 |
| AC-F03-06 | Normalization and Unicode limits in §4 accept exact bounds and reject one over; Draft blanks allowed, publication blanks rejected, malformed Unicode/NUL safely rejected. | U01,I06 |
| AC-F03-07 | RATING/TEXT and required booleans follow §4; 1–5 scale fixed, labels/interpretation preserved; malformed scales, coercions and unsupported types return 422. | U02,I07 |
| AC-F03-08 | Save accepts 0–10 questions; publication rejects 0/text-only, accepts valid 1 or 10 with RATING, and rejects 11. No failed publication creates eligibility/state changes. | U03,I08 |
| AC-F03-09 | Real change increments once; normalized no-op with current revision does not. Stale writes conflict; concurrent real saves with same revision have one winner and no lost update. | U04,I09 |
| AC-F03-10 | Matching-revision Draft delete returns 204 and removes only its definition; stale delete 409, absent 404, Published/Closed 409; Lecture can receive a new Draft afterward. | I10 |
| AC-F03-11 | Only DRAFT→PUBLISHED→CLOSED is allowed. Published/Closed definitions, modes and eligibility cannot be edited/deleted/reopened; invalid transitions are 409 for valid-shaped requests. | U04,I11,E04 |
| AC-F03-12 | Valid publication commits full frozen definition and exactly the selected eligible snapshot together; no partial state visible. | I12,H01 |
| AC-F03-13 | Empty eligibility or invalid member roles prevent publication with 422 and unchanged Draft/zero snapshot rows. | U03,I13 |
| AC-F03-14 | After publication, membership changes do not alter frozen access; required/type/scale/order/mode stay fixed and identified disclosure remains truthful for F-04/F-05. | U06,I11,I14,H03 |
| AC-F03-15 | Controlled edit/publish races produce exactly §7's two outcomes: save-first revision conflict or publish-first invalid-state rejection, never mixed published content. | I15 |
| AC-F03-16 | Controlled membership/publish tests prove the one-statement snapshot boundary before/after committed changes, including invisible uncommitted changes. | I16 |
| AC-F03-17 | Authorized Close changes Published to Closed once, retains publishedAt/revision and all questions/eligibility/responses, and sets closedAt only on success. | I17,H03 |
| AC-F03-18 | Sequential and concurrent duplicate publish/close produce one successful transition and subsequent 409, without timestamp/snapshot duplication or rewriting. Concurrent publish/close from Draft follows §7: close-first 409 then Published; publish-first permits subsequent Closed. | U04,I18 |
| AC-F03-19 | Close/submit follows BR-11's lock/commit order; close-first rejects submission without rows, submit-first response survives closing. A protocol harness alone is not actual F-04 integration evidence. | I19,H02 |
| AC-F03-20 | Injected write/known precommit failures leave no partial definition/order/snapshot/state changes; safe error, no success. Unknown commit outcome triggers reconciliation, not a fabricated rollback claim. | I20 |
| AC-F03-21 | Shared session/Origin/CSRF/access, route body ceilings, strict JSON/error precedence, safe logs and no-store responses follow §5; spoofed actor/mode cannot bypass checks. | I21,I23 |
| AC-F03-22 | Owner completes real create/save/publish and Published/Closed read-only navigation with persisted state confirmation, no premature success. | E01,E04 |
| AC-F03-23 | Validation, state/revision conflicts and network uncertainty show §8 recovery without automatic overwrite or false success; recoverable unsaved content retained, session loss clears private state. | E02,E03 |
| AC-F03-24 | Core authoring/publication/closing controls are labelled, keyboard usable, focus/error handling visible at 360px and 1280px. | E05,M01 |
| AC-F03-25 | After process restart against the same PostgreSQL database, committed Draft/Published/Closed definitions, IDs/order/revisions/timestamps and snapshots remain unchanged. | I22 |
| AC-F03-26 | Before implementation, reviewed contract/schema/security/handoff agreements exist; later acceptance has actual mapped unit/API/PostgreSQL/E2E/handoff results, meaningful RED/GREEN and human review, with pending work explicit. | M02,H01,H02,H03 |

## 10. Verification and completion boundaries

The [STS](f-03-survey-authoring-sts.md) specifies 40 planned cases: 6 unit, 24 API/real PostgreSQL integration, 5 UI/E2E, 2 supplementary/process, 3 cross-feature handoffs. All 26 AC have forward/reverse links. Document structure/link/traceability checks do not execute those tests. No implementation, schema, passing counts, teammate approval, TDD history, issue closure, release or PDF evidence is claimed here.

Provisional Product DoD 01–10 apply at feature level: implemented AC; preimplementation contracts/history; meaningful unit tests; real persistence/access/transaction integration; selected E2E/keyboard/responsive checks; genuine intended-behavior RED/GREEN; backend security/disclosures; actual build/test version/counts; substantive teammate review/integration; reproducible setup/docs. DoD 11–12 are integrated main release and A–F PDF gates, not satisfiable by this document. Confirm exact wording against the adopted shared version before acceptance.

Issue #12 can supply a reviewable contract package; it cannot establish implementation #19 or Sprint completion. Record actual results with test ID, real file/test name, command, environment, tested SHA, expected/observed outcome, pass/fail/skip counts and artifact/review links when available. Keep planned evidence distinct from executed results. Human teammate review remains pending.

## 11. Dependencies, open agreements and coordinated updates

Tracker snapshot: Issue #12 lead R1NNE0, planned reviewer Maibokdaimhai; no review occurrence or availability is asserted. #10 F-01 supplies auth; #11 F-02 supplies owned context/discovery; #13 F-04 supplies actual submit; #14 F-05 supplies count/results; #15 tooling; #16 SYS-01 schema; #19 F-03 implementation; #22 API integration; #23 E2E; #25 release; #26 evidence/PDF. #5 owns shared DoD/contracts and #6 evidence planning. Leads/reviewers remain the tracker/human team's authority.

| Agreement / gate | Required decision before dependent code | Owner / next coordination |
| --- | --- | --- |
| Shared conventions alignment | Record the staging shared/F-01/DoD versions used; apply their authentication/transport codes and session distinctions. Review remaining F-03-specific projection, normalization and body-limit agreements without changing shared middleware silently | #5/#10 with #12 reviewer |
| F-02 interface | Reconcile actual accepted #11 contract with §5.2 context serialization, selected-Lecture/create/existing links, role projections and UI routes; no duplicated discovery handler | #11/#12 |
| Schema subset | Approve §6 constraints, stable question IDs, reorder staging, redundant ownership invariant, Eligibility FKs, role fixtures and locking SQL/Prisma integration | #16/#12; no F-03 migrations |
| F-04 lock and answers | Adopt the same Survey lock and BR-11 ordering, frozen required/type/scale/IDs, disclosure and validation handoff; actual submit route/status contract remains #13, not invented here | #12/#13/#16 |
| F-05 meaning/privacy | Preserve frozen IDs/scale and closed response set; F-05 count/results projections, never identified account links to owner | #12/#14 |
| Dependency order | Follow Tracker §3: initial #16 User/session migration and synthetic login seed require working #15, reviewed #10 and accepted shared conventions/DoD. Later domain migrations require their respective reviewed feature contracts. #17 may start against the verified initial subset without full #16 completion or unrelated #11–#14 contracts. F-03 implementation #19 still requires reviewed #12, #17/#18 identity/context and its applicable verified #16 schema/constraints; full #16 closes only after its entire S1 scope is evidenced | #5/#16/#12; tracker maintainers |

Recommended later shared-file changes (not performed): add these two contract links under F-03 in `docs/README.md`; link AC-F03-01–26 and the STS in the F-03 row of `docs/traceability.md` and the contract reference in `docs/features.md`; after review, reference §6–7's accepted revision/snapshot/reorder details from `docs/system-sds.md` §§2–3,11; update `tracker.md` #12/#19/#16 contract/evidence references and status only on actual review/implementation evidence. Keep subsequent dependency updates consistent with the existing phased Tracker policy and record each reviewed/verified schema subset without claiming full #16 completion early. No existing shared file is changed by this package.

Ready to submit for independent specification and teammate review once the paired document checks are complete. This is not authorization to code against unresolved shared/schema/handoff agreements, mark tests passed, or close delivery gates.
