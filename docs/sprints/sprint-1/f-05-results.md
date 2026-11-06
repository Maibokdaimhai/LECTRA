# F-05 — Identified Aggregate Results and Privacy Projections

Version 0.1 · 2026-11-07 · Issue #14 · Sprint 1 · **Proposed engineering contract; not implemented or accepted.**

## 1. Purpose, scope and source status

Specify the Survey Owner's results view before implementing F-05: count only while Published; frozen per-question rating aggregates and identified text comments after Closed. Results are derived from committed responses, never independently editable records. The paired [STS](f-05-results-sts.md) contains planned checks, not execution evidence.

Sources: [SRS](../../srs.md) §§2–7, [Feature Inventory](../../features.md) F-05, [Traceability](../../traceability.md), [System SDS](../../system-sds.md) §§2–6,11,13–15, [decisions](../../decisions.md), [Sprint Plan](../plan.md) §2, [tracker](tracker.md) §§2–4 and [workflow](workflow.md) §§3–8. The supplied Issue #14 attachment defines this task. The remote Issue page was unavailable; no additional remote checklist is assumed.

No shared contract, Product DoD or F-01–F-04 feature files exist in this checkout at drafting. Prior-session PR #29 material at `fc64e2cc16557d77d67ef278d56e05c86c2621fc` is a provisional reference: [shared conventions](https://github.com/Maibokdaimhai/LECTRA/blob/fc64e2cc16557d77d67ef278d56e05c86c2621fc/docs/sprints/sprint-1/shared-contract.md) and [Product DoD](https://github.com/Maibokdaimhai/LECTRA/blob/fc64e2cc16557d77d67ef278d56e05c86c2621fc/docs/sprints/sprint-1/product-dod.md). It could not be freshly retrieved. Prior-session F-02/F-03 drafts are also proposals, absent locally and without an accepted version here. Use the actual baseline as authority; resolve §12 against the eventual accepted adjacent contracts before dependent code. Do not copy or merge unrelated proposal files.

Scope excludes anonymous collection/suppression policies, single-choice, CSV/export, filters/history/trends, overall instructor scores, Teaching Improvement Notes, response retrieval/submission and lifecycle mutations. BR-16 is covered by identity-free identified comments and keeping this JSON view distinct from future aggregate-only export. This feature does not implement the later export/privacy extensions.

## 2. Requirement traceability

| Requirement | F-05 obligation and boundary | Acceptance criteria |
| --- | --- | --- |
| FR-07 | Authorized Published count; Closed per-question aggregates and identified comments, no respondent-linked answers | AC-F05-01–14,18 |
| BR-02 | Owner-only endpoint, canonical ownership, same-Course isolation, no respondent-linked records | AC-F05-04–05,12,14 |
| BR-12 | Per-question answered denominator; five bins, exact mean, two decimals, null/no-data | AC-F05-06–10 |
| BR-13 | Published count only; Closed identified results without minimum-count suppression | AC-F05-01–03,10,21 |
| BR-14 | Truthful IDENTIFIED notice; no anonymity promise; F-04 owns the pre-answer disclosure | AC-F05-11–14,18,21 |
| BR-16 | Identified plain text only in authorized Closed results; no identity fields/export route; no anonymous text fallback | AC-F05-12–14,21 |
| NFR-01 | F-01 trusted identity, backend authorization, safe errors/logs/cache and output encoding | AC-F05-04–05,13–14,16,19 |
| NFR-02 | Derived consistent reads survive application restart; close/submit handoff preserves committed data | AC-F05-15,17,22 |
| NFR-05 | Stable AC and bidirectional planned STS; actual results/review/history remain later evidence | AC-F05-22 and every mapped case |
| NFR-07 | Labelled accessible values, keyboard and visible states at 360px/1280px | AC-F05-18–20 |

## 3. Actors, ownership and lifecycle

F-01 supplies an authenticated User ID and a freshly trusted OWNER role; no body, query or header may choose an actor. Authorization follows `Survey → Lecture → Section.ownerId = session.userId`. Sharing a Course grants no permission to another Section. Server-derived redundant Survey.ownerId must agree with the canonical Section ownership, but it is not a replacement for this predicate. Section ownership transfer is outside the baseline.

| Actor / resource | Result |
| --- | --- |
| No valid session, including expired/logged-out session | 401 UNAUTHENTICATED after the shared Origin perimeter |
| Authenticated RESPONDENT, including an eligible participant | 403 ROLE_FORBIDDEN, before Survey lookup |
| OWNER; missing/inaccessible Survey | Identical 404 NOT_FOUND; no existence/state/count disclosure |
| OWNER; own DRAFT | 409 RESULTS_NOT_AVAILABLE; no response count, questions or fabricated zero statistics |
| OWNER; own PUBLISHED, IDENTIFIED | 200 count-only projection (§4) |
| OWNER; own CLOSED, IDENTIFIED | 200 full Closed projection (§4), including zero/small counts |
| OWNER; own unsupported mode, including ANONYMOUS fixture | 409 MODE_NOT_SUPPORTED; no counts, comments or quantitative fallback |

Check scoped existence before state/mode. For an owned record, reject DRAFT before unsupported mode; no future privacy mode can fall through the identified serializer. S1 does not add an anonymous threshold engine. GET neither closes a survey nor changes definitions, answers, eligibility or participation.

## 4. Owner API and response projections

### 4.1 Endpoint and inputs

One endpoint: **GET `/api/surveys/:id/results`**, OWNER only, no request body, no query parameters. `:id` is a canonical lowercase UUID string (proposed shared ID serialization). Reject every supplied query key, including ownerId, studentId, questionId, status, mode, sort, page, cursor and format, rather than silently ignoring an attempted alternate projection. No respondent answer lookup, student filter, separate comment detail URL or new discovery route is introduced.

Success is 200 with `{ "data": ... }`. Survey metadata is exactly `id,title,status,mode,context`, where safe context is `course:{id,code,title}`, `section:{id,courseId,term,sectionCode}`, `lecture:{id,title,lectureDate,sequence}`. Display strings remain untrusted text. IDs are UUID strings; sequence is a positive integer; lectureDate is the SDS's local calendar date serialized `YYYY-MM-DD`, never timezone-shifted. Confirm this proposed context serialization with F-02/#16. No owner account identifier, transition/submission timestamps, eligibility roster or definition provenance is included.

Published data has **only** `survey` and `responseCount`. Omit questions, means, distributions and comments entirely, not null/empty placeholders. Example (synthetic identifiers/context):

```json
{
  "data": {
    "survey": {
      "id": "00000000-0000-4000-8000-000000000501",
      "title": "Lecture feedback",
      "status": "PUBLISHED",
      "mode": "IDENTIFIED",
      "context": {
        "course": {"id": "00000000-0000-4000-8000-000000000502", "code": "CPE334", "title": "Software Engineering"},
        "section": {"id": "00000000-0000-4000-8000-000000000503", "courseId": "00000000-0000-4000-8000-000000000502", "term": "Demo term", "sectionCode": "A"},
        "lecture": {"id": "00000000-0000-4000-8000-000000000504", "title": "Demo lecture", "lectureDate": "2026-11-07", "sequence": 1}
      }
    },
    "responseCount": 6
  }
}
```

### 4.2 Closed data and ordering

Closed data has exactly `survey,responseCount,questions`; survey has the same safe metadata with status CLOSED. Questions are the complete frozen definition in ascending stored position (maximum ten, not only answered questions). Each has `questionId,position,prompt,type,required,ratingScale`. Map questionId from Question.id; preserve it exactly. No Answer IDs are public.

RATING adds `answeredCount,distribution,mean`; ratingScale is `{min:1,max:5,minLabel,maxLabel,interpretation}` from the persisted publication snapshot. Distribution is an ordered five-element array `{score,count}` for scores 1–5, including zeros. Mean is null or an exact two-decimal **string**, e.g. `"3.50"`, avoiding JSON-number loss of trailing zeros. This wire representation and half-up rounding are F-05 proposals requiring shared acceptance (§12), not instructor-specified conventions.

TEXT has ratingScale null and adds only `comments`, an array of plain strings. It has no mean/distribution and no invented numeric scale. Return each nonblank persisted comment separately; preserve duplicates, line breaks and text content. Optional omitted/blank answers are absent under F-04's normalization rule, not empty cards. Sort per question by the stored string's UTF-8 byte sequence, equivalent to PostgreSQL `COLLATE "C"` on the UTF-8 database. Identical strings are indistinguishable ties; retain every occurrence. This does not order by person, bundle or time, and does not correlate comments across different questions. No server comment IDs or response-aligned arrays are exposed. A UI array position is merely a local rendering key, not a submission identity.

For S1 this one read returns all comments of the selected Closed survey, with no pagination, client-selected ordering or silent truncation. At most 2,000 code points per persisted text answer is F-04's limit. Do not impose an undocumented comment cap that loses valid feedback. Query/index verification remains necessary; later scaling work must preserve the same access/privacy policy rather than silently change the result shape.

Example Closed **question entries** inside `data.questions` (survey metadata/responseCount follow §4.1; responseCount is 6 for this fixture):

```json
[
  {
    "questionId": "00000000-0000-4000-8000-000000000511",
    "position": 1,
    "prompt": "How clear was the content?",
    "type": "RATING",
    "required": true,
    "ratingScale": {"min": 1, "max": 5, "minLabel": "Not clear", "maxLabel": "Very clear", "interpretation": "Higher means clearer content."},
    "answeredCount": 6,
    "distribution": [{"score": 1, "count": 1}, {"score": 2, "count": 1}, {"score": 3, "count": 1}, {"score": 4, "count": 1}, {"score": 5, "count": 2}],
    "mean": "3.33"
  },
  {
    "questionId": "00000000-0000-4000-8000-000000000512",
    "position": 2,
    "prompt": "Suggestions",
    "type": "TEXT",
    "required": false,
    "ratingScale": null,
    "comments": ["Clear examples", "Same feedback", "Same feedback"]
  }
]
```

Construct explicit allowlisted representations; do not return broad ORM rows and strip fields only in React. No names, avatars, student/respondent IDs, Membership/Eligibility/Participation rows, ResponseBundle/Answer IDs, sessions or timestamps appear anywhere in owner JSON, HTML, hidden DOM/data attributes or client storage. Per-score counts are aggregates; text content is intentionally individual but unlabelled, not a respondent-linked answer record.

### 4.3 Errors, security and precedence

Use the baseline server-side session/absolute expiry and shared F-01 middleware; F-05 does not regenerate/extend sessions or implement login. Proposed PR #29 Origin rule: reject explicit foreign or `null` Origin with 403 ORIGIN_FORBIDDEN; protected same-origin safe GET may omit Origin and does not require a CSRF token. Unsupported unsafe methods still pass the shared Origin/session/applicable CSRF checks before 405; they must not become mutation handlers. No permissive CORS exception.

Order: shared Origin/transport checks → session → supported method/applicable CSRF → OWNER role → UUID/body/query validation → scoped Survey lookup → state/mode policy → result queries and serialization. Thus a Respondent's otherwise valid request is 403 without a lookup, an Owner's malformed UUID/query is 422, and a well-formed inaccessible ID is 404 regardless of its actual state. Do not leak Draft existence through a premature 409.

| HTTP / error.code | Trigger | Response / effect |
| --- | --- | --- |
| 400 MALFORMED_REQUEST | HTTP/transport syntax rejected by shared middleware | Safe error, no result data |
| 401 UNAUTHENTICATED | Missing/expired/revoked session | Clear private client data; login handoff |
| 403 ROLE_FORBIDDEN / ORIGIN_FORBIDDEN / CSRF_INVALID | Role, Origin or applicable unsafe-method CSRF denial | No resource metadata; CSRF does not apply to supported GET |
| 404 NOT_FOUND | Missing or foreign-owner Survey | Same safe message: “Survey not available.” |
| 405 METHOD_NOT_ALLOWED | Unsupported method on results route after security checks | Allow: GET; no write |
| 409 RESULTS_NOT_AVAILABLE | Own Draft | Safe unavailable state, no counts/results |
| 409 MODE_NOT_SUPPORTED | Own non-identified Published/Closed survey | Fail closed, no anonymous fallback |
| 422 INVALID_REQUEST | Bad UUID, any body or query, malformed supported request shape | Safe fixed message/allowed field paths, no input echo |
| 503 SERVICE_UNAVAILABLE | Known database unavailability | No partial/previous result disguised as success; safe read retry |
| 500 INTERNAL_ERROR / RESULTS_INCONSISTENT | Unexpected failure / detected invalid persisted result invariants (§6) | No partial analytics; safe diagnostic class only |

Envelope: `{ "error": { "code": "NOT_FOUND", "message": "Survey not available." } }`, optional `fields` only for safe validation paths. Never expose SQL, stack, connection strings, feedback, tokens or account values. Logs identify operation/correlation ID and safe error class, not request/response bodies, cookies or comments. Use the existing shared transport protections; this GET adds no request JSON parser or larger body allowance.

All protected success/error responses send `Cache-Control: private, no-store`; do not emit result ETags or 304 cached-result responses. Ignore conditional validators and perform normal authorization/read, or let a shared no-store policy do so consistently. Client requests/results stay out of persistent browser storage, service-worker caches and analytics payloads. Clear in-memory results on logout/session expiry, role/account/route changes and denial; never flash the previous survey's results while loading another.

## 5. Statistics and exact rounding

Let R be the number of committed Participation rows for this Survey. Unique (surveyId,studentId) makes `responseCount = R = COUNT(*)` equivalent to distinct submitted respondents. It is not eligibility size, bundle/answer count or current Section membership. No student IDs need be selected to compute it.

For each RATING question q, let c1…c5 count valid persisted rating answers of scores 1…5 belonging to q and this Survey's committed ResponseBundles. Then `N = answeredCount = c1+c2+c3+c4+c5`, `S = c1+2c2+3c3+4c4+5c5`, and the unrounded arithmetic mean is S/N when N>0. Missing optional answers contribute neither a row, a zero nor a denominator increment. One response can answer multiple questions; it still contributes once to R. Do not join multiple question/comment rows into Participation before counting, which multiplies respondents.

When N=0: all five bins are zero and mean is null. Display “No responses yet” if R=0; otherwise “No answers to this question”. There is no minimum-count suppression for Closed identified results: N=1 is visible and uses its actual rating. RATING means never become 0, NaN or a dash pretending to be a number.

Proposed decimal half-up to two places, applied **once** to exact S/N: for N>0 compute integer hundredths `H = floor((200*S + N) / (2*N))`; format H/100 with exactly two fractional digits, without binary floating-point conversion before rounding. Use exact integer/BigInt or PostgreSQL numeric arithmetic through formatting; integer division of positive BigInts gives the specified floor. Do not use JavaScript `toFixed()` on an already approximated AVG or average separately rounded values. If counts cannot be represented safely in the JSON integer representation, fail safely rather than silently lose precision; this is not a new product capacity guarantee.

| Known input | R / N / S | Required mean | Purpose |
| --- | --- | --- | --- |
| Scores 1,2,3,4,5,5 | 6 / 6 / 20 | "3.33" | Five bins 1,1,1,1,2 |
| Optional scores 2,4,5; three omissions among those six participants | 6 / 3 / 11 | "3.67" | Denominator is 3, not 6 |
| Seven 1s and one 2 | 8 / 8 / 9 | "1.13" | Exact tie 1.125 rounds up |
| Thirteen 2s and twenty-seven 3s | 40 / 40 / 107 | "2.68" | Exact tie 2.675; binary-float trap |
| 219 ones, 31 twos (unit histogram fixture) | 250 / 250 / 281 | "1.12" | 1.124 below tie |
| 437 ones, 63 twos (unit histogram fixture) | 500 / 500 / 563 | "1.13" | 1.126 above tie |
| One score 1 / one score 5 | 1 / 1 / 1 or 5 | "1.00" / "5.00" | Endpoints and trailing zeros |
| One participant answers TEXT only, optional rating omitted | 1 / 0 / 0 | null | Valid response, no rating answers |
| No submissions | 0 / 0 / 0 | null | Real empty Closed result |

Results use each question's frozen meaning. A slow→fast pacing scale does not measure suitable→unsuitable pacing or overall teaching quality. Do not combine questions or surveys into an overall average, rank instructors, or infer comparability from the numeric 1–5 range.

## 6. Data, query and consistency responsibilities

Issue #16/SYS-01 owns schema, migration, indexes and fixtures. **No F-05-specific migration or persistent summary table is required by this design.** Implementation #21 owns read queries/serializers/UI. Schema prerequisites must be reviewed in #16 before code; do not create a competing Answer/Results model.

| Relation / constraint | F-05 use / owner of writes |
| --- | --- |
| Survey.lectureId unique → Lecture.sectionId → Section.ownerId; Section → Course | Scope selected Survey through canonical Section ownership; read safe context only; F-02/#16 seed contexts, F-03 owns lifecycle |
| Survey status/mode, frozen Question definitions | State/mode release decision, exact question ID/position/prompt/type/required/scale readback; F-03 freezes before publication |
| Unique Question(surveyId,position), Question.id PK | Deterministic complete question ordering; no joins by text, category or mutable template |
| Unique SurveyEligibility(surveyId,studentId), FKs to Survey/User | Frozen permission basis for F-04 participation; F-05 does not expose this roster or recalculate from Membership |
| Unique Participation(surveyId,studentId), FK to eligibility | Count committed rows for R separately from answers; F-04 owns atomic insertion |
| ResponseBundle(id,surveyId,identifiedStudentId) | Internal survey-scoped answer join using bundleId/surveyId only; identified link stays in storage, not owner projection |
| Unique identified bundle per (surveyId,identifiedStudentId); unique Answer(bundleId,questionId); same-survey composite FKs | Prevent duplicate counted answers/cross-survey associations; #16 constraints and F-04 atomic validation supply these guarantees |
| Answer typed values; integer rating CHECK 1–5; correct question type/required flags | Aggregate persisted valid answers, not live request input; F-04 owns completeness, optional blank normalization and one complete response per participation |

Use parameterized, scoped SQL/Prisma with explicit columns. A read-only REPEATABLE READ transaction covers ownership, Survey state, count, definitions, rating groups and comments. One SQL statement producing the entire correctly scoped representation is equivalent. Multiple independent READ COMMITTED statements are insufficient: a concurrent submission/Close could mix Published state or R with later answer data.

Algorithm: (1) authenticate/validate request; (2) obtain scoped Survey and safe context within the snapshot; (3) enforce state/mode; (4) count Participation for this Survey; (5) Published: return immediately with count-only serializer, **without querying answer/comment content**; (6) Closed: fetch frozen ordered definitions, group ratings by survey/question/score, read only question ID and text for TEXT comments, construct every question including unanswered ones; (7) validate/serialize the complete projection and return after successful read completion. No broad User joins, no response-level object spanning questions, no session/identity lookup for display. Do not join multiple one-to-many sets and count the resulting fanout.

Check consumed Closed data for invalid score/type representations and derived invariants `0 ≤ N ≤ R`, nonnegative integer bins, sum of bins=N, and correct frozen rating range. Persisted validity is primarily enforced by #16/F-04; do not silently coerce/filter detected corrupt values into plausible means. A detected inconsistency returns 500 RESULTS_INCONSISTENT without partial data and safe diagnostic context. This is not a separate database repair/audit feature. F-05 never repairs, deletes or rewrites stored responses.

A snapshot before Close commits may return Published count-only, even if Close commits before HTTP delivery. A snapshot observing Closed includes every complete F-04 submission committed before the closing transaction under BR-11. It cannot include a response whose submit lost to Close. GET takes no exclusive Survey lock, makes no lifecycle change and must not block normal submission by adopting a write lock. F-03/F-04 must share their existing Survey-lock protocol; F-05 does not invent another close rule.

On any read/query/serialization failure, discard the entire projection and return a safe failure; never fall back to zeros or an earlier successful response. GET retry is safe and may observe a newer committed snapshot. Repeated Closed reads/restart against unchanged stored data give the same aggregates, metadata and comment multiset/order; authentication/session handling may require a fresh login after restart. Do not regenerate demonstration data on API startup.

Existing index requirements: Section.ownerId, Lecture.sectionId, Survey.lectureId/status, Question survey/order, Eligibility/Participation composite keys, Answer bundle/question. #16 reviews survey/question-leading aggregation paths (e.g. Answer(surveyId,questionId)) using the agreed schema/query plan before adding indexes. F-05 does not prescribe an unrelated schema expansion or claim measured performance. NFR-04's load target remains a later verification responsibility.

## 7. Privacy, disclosure and text safety

Sprint 1 is **identified in storage**. Safe Owner text: “This survey is identified. Answers remain linked to accounts in storage. This view omits account identifiers, but written content and small-group results may still identify people.” F-04 must give the truthful pre-answer disclosure under BR-14; this view cannot substitute for it. Never label unlabelled comments “anonymous”, promise anonymity, or offer per-student participation lists.

Render titles, context, prompts, anchors, interpretations and comments as plain text through React text nodes/DOM textContent (equivalent output encoding allowed), never dangerouslySetInnerHTML, executable HTML, interpreted Markdown or automatic embedded content. Preserve comment line breaks with CSS and wrap long strings. Text such as `<script>` or an image onerror attribute must remain visible literal text and never execute or trigger injected network activity. Do not deduplicate comments or redact their content automatically; the guarantee is exclusion of metadata links, not removal of all possible self-identification.

S1 exposes Closed identified text regardless of small counts. It does not implement anonymous thresholds or raw-text retention policy. Unexpected anonymous mode is rejected server-side before reading answers; future F-06 must replace this fail-closed branch only through its accepted privacy design and tests. Future F-08 must reuse policy while providing aggregate-only export, not serialize this comments-bearing JSON into CSV. No export endpoint/button is delivered here.

## 8. UI contract

Proposed Owner route `/surveys/:id/results`, reached from F-02's own-survey navigation and F-03's management view; confirm names with those contracts. F-05 calls only its results GET for analytics. F-03 owns closing; after confirmed Close the view refetches results, rather than manufacture Closed data from an old Published response. F-02 continues to own discovery; a direct URL still requires the backend checks.

| State / element | Observable UI behavior |
| --- | --- |
| Published | Context, persisted PUBLISHED badge, “Submitted responses” R, and “Question results and written feedback become available after closing.” No score chart, means, comments or hidden payload/DOM values. A real zero count is allowed here. |
| Closed header | Persisted CLOSED badge, context/title and “Submitted responses” R; truthful identified notice (§7), no participant list or overall instructor score. |
| RATING question | Frozen position/prompt/required flag, 1/5 endpoint labels and interpretation; “Answered this question” N and “Average rating” exact two-decimal mean or no-data text. Explain optional missing answers are excluded; never use R as this mean's denominator. |
| Distribution | Five horizontal blue bars using SDS §6.1 tokens, score labels and exact counts outside fills. A labelled HTML table exposes the same score/count values, with a visible question heading and text description; color/tooltips are supplementary. No unlabeled percentages or invented quality direction. |
| TEXT question | Neutral white cards under frozen prompt, one per comment, preserved line breaks, safe literal text and no names/avatars/IDs/times. Empty array displays “No written feedback for this question.” |
| Empty Closed | R=0: “No responses yet”; keep actual frozen questions, zero bins/null means, no sample data. R>0 and N=0: “No answers to this question”, not 0.00. N=1 is shown without suppression. |
| Loading / refresh | Static busy indicator, no invented result numbers. Clear old survey/account data before navigation/loading; render a coherent new snapshot only after a successful response. Manual retry/refresh is a safe GET. |
| Draft / unsupported mode | Safe unavailable message from 409, no zero analytics or anonymous preview. Do not offer a results-dependent action as if results existed. |
| Error / denial | 401 clears private data and routes to F-01 login; 403/404 clears results and shows generic denied/unavailable state. Network/500/503 shows an error and Retry without fake count/mean or claiming data loss. Hide prior result content on failure until a successful retry. |
| Keyboard / screen readers | Logical headings/landmarks, native links/buttons, labelled table/columns, visible focus, polite busy/error updates and keyboard-operable navigation/Retry. Charts are not required keyboard stops when the table conveys their values. |
| 360px / 1280px | Single-column cards on narrow screens, labelled values/table kept readable, long Thai/English text wraps; desktop can place table beside chart. No horizontal page overflow or tiny clipped count labels. Inspect zoom/reflow per SDS visual checks. |

No localStorage/IndexedDB persistence of results or raw feedback; no analytics/error-report payload containing comments. Browser Back after logout or switching users must not recover an earlier Owner's result view without reauthorization.

## 9. Acceptance criteria and forward traceability

Every row is an acceptance target, not a satisfied result. TEST-F05 suffixes below expand to complete case IDs in the [STS](f-05-results-sts.md).

| AC ID | Required observable outcome | Planned TEST-F05 cases |
| --- | --- | --- |
| AC-F05-01 | Own Draft results GET is 409 RESULTS_NOT_AVAILABLE with no statistics; UI shows unavailable, never invented zeros. | U04,I02,E02 |
| AC-F05-02 | Own identified Published GET returns exactly survey metadata and committed responseCount, including real zero; no answer/comment query or quantitative payload/DOM. | U04,I02,I10,E02 |
| AC-F05-03 | Own identified Closed GET returns full ordered frozen question results and identified comments; low counts are not suppressed and stored data is unchanged. | U04,I02,I11,E01 |
| AC-F05-04 | Unauthenticated 401, Respondent 403, foreign/missing Survey 404, including same Course/different Owner; direct calls and guessed IDs cannot bypass it. | U04,I01,I09,H02 |
| AC-F05-05 | UUID/body/query/method/Origin and error precedence follow §4.3; safe messages do not reveal private records or echo inputs. | I01,I08,I09 |
| AC-F05-06 | responseCount equals committed distinct participating respondents, not eligibility, bundles/answers or current membership; joins cannot multiply it. | U01,I03,I10,I14 |
| AC-F05-07 | Each rating answeredCount includes only its own persisted valid answers; optional omissions add neither zero nor denominator weight. | U01,I03,I14 |
| AC-F05-08 | Each rating has five ordered integer bins for scores 1–5, zeros included, summing exactly to answeredCount. | U01,I03,I14 |
| AC-F05-09 | Exact S/N is rounded once with proposed decimal half-up; §5's endpoint/tie/below/above fixtures and two-decimal strings match, without binary-float ambiguity. | U02,I04,E01 |
| AC-F05-10 | R=0 and R>0/N=0 produce null means and all-zero bins with distinct no-data messages; never 0.00/NaN or fabricated observations. | U03,U06,I05,E02 |
| AC-F05-11 | Frozen IDs/prompts/order/types/required flags/scales/anchors/interpretation are preserved; no live template/current-membership substitution or cross-question comparability claim. | U05,I06,E01 |
| AC-F05-12 | Closed TEXT comments preserve literal strings, duplicates and line breaks, use deterministic per-question ordering, and carry no identity/bundle/timing or cross-question response linkage. | U05,I07,E03 |
| AC-F05-13 | Unsafe comments and all user-authored metadata render as literal text; scripts/event handlers/embedded content do not execute. | U06,E03 |
| AC-F05-14 | JSON, DOM, cache/storage, logs and analytics exclude forbidden identity/participation/bundle/timing/auth fields and raw feedback in logs; notice makes no anonymity promise. | U05,I07,I09,E03,H02 |
| AC-F05-15 | Each result response is one committed snapshot across state/count/definitions/answers, including submit and Close races; no mixed Published/Closed projections. | I10,I11,H01 |
| AC-F05-16 | Known storage outage 503 and unexpected/inconsistent data 500 return safe failures, not partial/zero results; Retry performs a safe new read. | I12,I14,E04 |
| AC-F05-17 | Repeated reads and restart against unchanged PostgreSQL preserve results/metadata/comment order and all stored rows; GET has no domain writes. | I13,H01 |
| AC-F05-18 | Owner sees correct Published/Closed view, per-question denominator/mean/table, frozen meaning, comments and truthful identified notice at the proposed navigation handoff. | U06,E01,E02,H01 |
| AC-F05-19 | Loading, network/database errors, session expiry and denials show §8 states; old/private content is cleared and no premature/fabricated numbers displayed. | E04,H02 |
| AC-F05-20 | Results navigation/Retry and equivalent numerical table work by keyboard with labels/focus/readable layout at 360px and 1280px. | E04,M01 |
| AC-F05-21 | Own unsupported/anonymous mode is safely rejected with no text/count fallback; no S2 thresholds, export, history or overall instructor score are added. | U04,I02 |
| AC-F05-22 | Reviewed/versioned precode interfaces/schema/rounding and mapped STS exist before dependent implementation; later acceptance records actual results, meaningful TDD and human review, leaving release/PDF gates separate. | M02,H01,H02 |

## 10. Planned verification and evidence boundaries

The STS specifies **28 cases: 6 unit, 14 API/real PostgreSQL, 4 selected UI/E2E, 2 supplementary/process and 2 cross-feature handoffs**. All 22 AC map forward and every test maps back. Every application case is **Planned / Not run**. No schema, query, UI, executed test, TDD run, measured performance, student contribution or teammate approval is supplied by these documents.

Meaningful TDD candidates: known-answer optional denominator/bin/rounding assertions; Published projection containing no question data; same-Course foreign-owner rejection. Capture real intended-behavior RED before implementation and GREEN afterward with actual test names/versions/output. Import crashes or invented retrospective history are not rule failures. Unit results alone cannot prove real PostgreSQL authorization/snapshot behavior or browser escaping.

Provisional Product DoD 01–10 require implemented AC/layers, recorded preimplementation design, meaningful unit tests, real API/database tests, selected E2E/accessibility, genuine RED/GREEN, security/disclosure, actual tested SHA/commands/counts, substantive teammate review/integration, and reproducible setup/docs. Confirm exact accepted wording under #5. Release DoD 11–12 (accepted reviewed main release and A–F PDF) remain #25/#26 responsibilities, not satisfied by this feature package.

Record actual test file/name, AC/STS ID, command, environment/DB version, tested commit, observed result, pass/fail/skip counts, safe artifacts and real reviewer feedback when available. Do not include raw feedback/tokens in public run logs. A documentation-only link/formula/traceability check is not application execution.

## 11. Delivery responsibilities and exclusions

Tracker snapshot assigns Issue #14 and implementation #21 to R1NNE0, with the other member Maibokdaimhai as planned reviewer; no review occurrence/availability is claimed. #10/#17 supply trusted identity, #11/#18 owned context/discovery, #12/#19 lifecycle/frozen definitions, #13/#20 atomic responses and BR-11, #15 tooling, #16 migrations/seeds, #22/#23 integrated API/E2E, #24 reproducible instructions, #25 release and #26 evidence/PDF. Current tracker gates remain authoritative until a coordinated revision; this contract does not authorize Git/GitHub actions or mark any gate Done.

BR-14 pre-answer disclosure is a joint F-03/F-04 obligation; F-05 consumes mode and gives the Owner's truthful notice. BR-16 future aggregate CSV must omit these text comments. F-06 will add accepted anonymous safeguards; F-07 adds choices/metric provenance; F-09 adds compatible history analysis and F-10 private notes. None is implemented or made a prerequisite for this identified S1 results view.

## 12. Open agreements and recommended shared updates

| Agreement | Required resolution before dependent code | Coordination |
| --- | --- | --- |
| Shared version/conventions | Confirm accepted PR #29/shared DoD version, UUID/errors, Origin handling/no-store; approve mean as two-decimal string and exact half-up rule | #5/#10/#14 and teammate |
| Owned navigation/context | Reconcile actual accepted F-02/F-03 routes and §4 context/date/scale serialization; preserve separate discovery/definition/results responsibilities | #11/#12/#14 |
| Schema/query subset | Confirm composite FKs, participation/bundle uniqueness, typed answers, exact numeric conversion, UTF-8 C collation and query indexes; no competing summary schema | #16/#13/#14 |
| Submission/Close/read snapshot | Verify real F-03/F-04 Survey-lock ordering and committed-only F-05 reads; handoff H01 must use actual routes, not a mock lock harness | #12/#13/#14 |
| Comment/privacy interface | Confirm unlabelled per-question string arrays/order, no participant/bundle/time projection, safe rendering/log policy; full S1 comment read without silent truncation | #14 reviewer; future #6 evidence uses safe artifacts |
| Dependency gate | Current tracker §3 gates #16 execution on recorded #10–#14 contracts. Any proposed staged schema subset needs explicit coordinated approval; do not infer it from unmerged PR #29 | #5/#16/tracker maintainers |

Recommended later edits, **not performed**: add links to both F-05 documents under F-05 in `docs/README.md` and `docs/features.md`; add AC-F05-01–22/planned STS references to F-05 mappings in `docs/traceability.md`; after acceptance, reference exact rounding/projection/query agreements from `docs/system-sds.md` §§6.2,11,13; add reviewed #14 version/#21 evidence links in `tracker.md` without prematurely changing completion claims. Add the adopted rounding/wire rule to shared conventions only through coordinated review; do not silently treat this proposal as an existing shared decision.

This package is prepared for independent specification and teammate review. Implementation, executed verification, shared-agreement acceptance and delivery closure remain pending.
