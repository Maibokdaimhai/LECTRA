# F-02 - Owned Context and Eligible Survey Discovery Contract

Version 0.1, 2026-11-06. Proposed preimplementation contract for Issue #11; implementation belongs to #18. Lead: R1NNE0; planned opposite-member reviewer: Maibokdaimhai, following the dated [tracker](tracker.md). These are proposed responsibilities, not completed contributions or human approval. No application, migration, executable test or passing result is supplied here. Verification design: [F-02 STS](f-02-context-discovery-sts.md).

## 1. Authority, purpose and scope

Read with the [SRS](../../srs.md), [Feature Inventory](../../features.md), [traceability](../../traceability.md), [System SDS](../../system-sds.md), [decision log](../../decisions.md), [Sprint Plan](../plan.md), [tracker](tracker.md) and [workflow](workflow.md). The instructor sources remain `group_work_specs_v1.pdf` sections 5.2, 6 Theme 10 and 8.2, and `project_deliverable_1_v1.pdf` section 3.5. Exact endpoint schemas, ordering and AC/STS IDs below are proposed team designs, not instructor-prescribed interfaces.

The public Issue #11 page could not be retrieved during drafting. The owner's supplied Issue #11 requirements are the issue-level source used here; no additional remote checklist, comment, approval or live issue state is asserted.

F-02 provides the smallest read-only path from a trusted actor to an owned lecture or eligible survey. It supplies four existing endpoint families, context selectors/current-work lists and the caller's participation boolean. It does not create academic records, publish a survey, read a questionnaire/answer bundle, submit feedback or calculate results.

### Provisional PR #29 reference

The shared contract, Product DoD and F-01 files are not in this working tree. The locally readable PR #29 snapshot `fc64e2cc16557d77d67ef278d56e05c86c2621fc` was inspected as a **provisional** reference, not copied, merged or adopted. See its [shared conventions](https://github.com/Maibokdaimhai/LECTRA/blob/fc64e2cc16557d77d67ef278d56e05c86c2621fc/docs/sprints/sprint-1/shared-contract.md), [F-01 contract](https://github.com/Maibokdaimhai/LECTRA/blob/fc64e2cc16557d77d67ef278d56e05c86c2621fc/docs/sprints/sprint-1/f-01-authentication.md) and [Product DoD](https://github.com/Maibokdaimhai/LECTRA/blob/fc64e2cc16557d77d67ef278d56e05c86c2621fc/docs/sprints/sprint-1/product-dod.md). Reconcile the accepted versions under #5 before #18 code; this document does not assert the PR's current approval/merge state.

This proposal follows their `AC-F02-xx` / `TEST-F02-U/I/E/M/Hxx` naming, camelCase JSON, uppercase enums, safe error envelope, bounded pagination and session-derived actor. The two filenames follow the owner's requested names and the provisional F-01 contract/STS pairing. No shared file is edited by this task.

## 2. Requirements and layer responsibilities

| Source ID | F-02 responsibility | Acceptance coverage |
| --- | --- | --- |
| FR-02 | Owned Course/Section/Lecture navigation; only eligible Published/Closed respondent discovery. | AC-F02-02 through AC-F02-08 |
| FR-12; SYS-01 | Specify reproducible academic context/relationship fixtures; #16 authors migrations/seed. | AC-F02-01, AC-F02-20 |
| BR-01 | Use F-01's trusted server identity, never supplied actor fields. | AC-F02-02, AC-F02-10, AC-F02-11 |
| BR-02 | Section ownership, same-Course isolation, self-only participation and safe projections. | AC-F02-03 through AC-F02-10 |
| BR-03 | Discover from the publication eligibility snapshot, not current Membership. | AC-F02-07, AC-F02-08, AC-F02-17 |
| BR-04 | Hide Drafts from respondents; show Published/Closed without granting submission permission. | AC-F02-06, AC-F02-07, AC-F02-19 |
| BR-23 | Resolve Survey through Lecture/Section; one survey per lecture is a shared F-03/#16 invariant. | AC-F02-01, AC-F02-05, AC-F02-06, AC-F02-19 |
| NFR-01 | Backend scoping, safe failures, no credentials or private owner/other-student data. | AC-F02-02, AC-F02-10, AC-F02-18 |
| NFR-03 | Repeatable safe setup and documented real commands once implemented. | AC-F02-01, AC-F02-20 |
| NFR-05 | Every AC has planned verification; actual results/history remain separate. | All AC; AC-F02-20 |
| NFR-07 | Keyboard, labels, loading/empty/error states and 360px/1280px layouts. | AC-F02-14 through AC-F02-16 |

UI and API read services require implementation. Database definition/seed changes are coordinated through #16, not a second F-02 migration history. **No change in F-02** to password/session storage, auth endpoints, question definitions, publication writes, response/answer writes, result calculations, analytics or deployment infrastructure. F-02 consumes User, Survey, SurveyEligibility and Participation interfaces owned jointly with their relevant features; it does not redefine their writes.

## 3. Actors, access and visibility

F-01 resolves immutable request-local `actor: { userId, role }` from the signed session and trusted User row on every request. F-02 never builds an actor from URL/query/body/header values. A session role cached in React cannot grant access.

| Read surface | OWNER | RESPONDENT | No usable authenticated identity |
| --- | --- | --- | --- |
| Course list | Courses having at least one Section owned by this actor. | 403; use safe context embedded in eligible surveys. | 401 |
| Section list for a Course | Only this actor's Sections, after establishing owned Course access. | 403 | 401 |
| Lectures for a Section | Only after resolving `Section.ownerId = actor.userId`. | 403 | 401 |
| Survey list | Owned surveys, including Draft/Published/Closed; optional owned lecture selector. | Only Published/Closed with `SurveyEligibility.studentId = actor.userId`; own submitted boolean only. | 401 |

A shared Course is not shared ownership. Course existence alone cannot authorize a Section, Lecture or Survey. Owner Survey queries constrain the full `Survey -> Lecture -> Section.ownerId` relation and require redundant Survey.ownerId to agree. Mismatched rows are excluded from discovery; #16/F-03 must reject creating them. A valid UUID or membership in another Section never expands scope.

Respondent discovery uses **SurveyEligibility**, even if current Membership was later added/removed. Participation is `EXISTS Participation(surveyId, actor.userId)`; there is no join to another student's answers or participation list. Respondent collections omit inaccessible records and return 200 with the caller's remaining set, including an empty set. They do not return 403 merely because unrelated surveys exist.

For a named owner-context parent, missing and inaccessible resources both return the same 404. Respondent direct questionnaire/response reads belong to F-03/F-04: they must similarly hide Draft/ineligible IDs with 404, independently of list filtering. Those are explicit handoff tests, not a new F-02 detail endpoint.

## 4. Workflows and navigation handoffs

### 4.1 Owner

1. After F-01 resolves OWNER, load owned Courses and current-work surveys independently.
2. Select a Course; clear previous Section/Lecture selections and fetch its owned Sections.
3. Select a Section; clear the previous Lecture and fetch its lectures.
4. Select a Lecture. `existingSurvey = null` offers the F-03 create action; otherwise offer that survey's F-03 management or F-05 Closed-results action. Do not create another survey optimistically.
5. `GET /api/surveys?lectureId=...` scopes the work list to that owned lecture. Clearing the selection removes that query and returns all owned work. Closed records can remain in this operational list; this is not a date/state history search.

### 4.2 Respondent

Load `GET /api/surveys` after F-01 resolves RESPONDENT. Each card shows its safe academic context, survey state/mode and own submitted status. It cannot enumerate the general Course/Section catalog.

| Current server state | Own submitted | Action / explanation |
| --- | --- | --- |
| Published | false | Answer survey: navigate to the F-03 questionnaire read/F-04 response workflow. |
| Published or Closed | true | View submission: navigate to F-04 own identified status/answer retrieval. No edit/resubmit promise. |
| Closed | false | Collection ended; no Answer action. |
| Draft or not eligible | Either | No card or content. Direct target access is rechecked by its owning feature. |

F-02 supplies navigation by authorized survey/lecture IDs, not duplicate detail/answer APIs or privileged client action URLs. Exact target UI routes are a preimplementation F-03/F-04/F-05 agreement in section 10; no working target screen is claimed now. Target services always revalidate current identity/state/eligibility. A survey closing or a Draft being deleted after a list read may invalidate a link: show the target's safe denial/state message and refresh the list. A rendered action is not a reservation or permission to write.

## 5. Exact proposed API contract

### 5.1 Common read protocol

All F-02 operations are authenticated GETs, return JSON and `Cache-Control: no-store`, and perform no application-domain writes. Use same-origin credentialed fetch and F-01's read Origin/session policy; no CSRF token is required for these safe reads. An explicitly foreign Origin is rejected under F-01; a same-origin GET can omit Origin. F-02 does not weaken login/write CSRF rules or extend a session deadline.

For requests passing F-01's outer Origin/method/session handling, order checks as authentication, endpoint role, exact query/path syntax, scoped parent access, then read/projection. Correctly originated guest/expired requests return 401 before domain input/existence details; authenticated respondents on owner-only context routes receive 403 before UUID/parent validation. Query validation errors can be 422; syntactically valid hidden/missing named parents are 404. Do not infer parent existence from different envelopes or total counts.

Known context paths support GET only; unsupported methods return 405 with `Allow: GET` and no domain write. The shared `/api/surveys` path's non-GET operations belong to F-03; do not install an F-02 method guard that blocks its POST. Any framework-generated HEAD handling must be reconciled with the agreed method policy before code, not accidentally bypass authentication or leak counts.

List success is exactly `{ "data": { "items": [], "pagination": { "limit": 20, "offset": 0, "total": 0 } } }`, with the item type below. `total` counts only authorized records after this endpoint's selectors. There are no additional response fields or unlisted nested fields.

### 5.2 Input, pagination and ordering

| Parameter | Contract |
| --- | --- |
| limit | Optional single canonical decimal string; default 20, integer 1-100. No sign, fraction, exponent, leading zeros, whitespace, empty value, array or duplicate key. |
| offset | Optional single canonical decimal string; default 0, integer 0-10,000. `0` is valid; otherwise no leading zeros. Same strict shape rules. |
| courseId, sectionId, lectureId | UUID syntax: 36-character lowercase hexadecimal hyphenated `8-4-4-4-12` representation; trusted seed/server generates IDs. No trim, case rewriting, array, duplicate parameter or DB cast exception. Version-generation policy remains #16/#5 agreement; format is not authorization. |
| Other fields | Reject with 422, including actor/role/student/owner IDs, arbitrary sort, `fromDate`, `toDate`, `status`, search and response-subgroup fields. No silent F-09 filter support. |
| GET body | Not an input surface; reject a nonempty body with 400 `UNEXPECTED_BODY`, without parsing it as actor/filter authority. No F-04 JSON limit or write behavior is redefined. |

Only parameters listed for a particular endpoint are allowed. Path `sectionId` is not a query option. Reject out-of-range pagination before arithmetic/query execution; do not coerce invalid syntax. An authorized collection with `offset >= total` returns 200, empty items and its real total, including offset 10,000. Do not fetch an unbounded list to paginate in React.

Ordering is fixed, with PostgreSQL `C` text collation for textual keys so machine locale does not change pages: Courses by code ascending then id ascending; Sections by term descending, sectionCode ascending, id ascending; Lectures by sequence ascending then id ascending; Surveys by lectureDate descending, lecture sequence descending, survey id ascending. Term order is lexical, not a claim of chronological term interpretation. Calendar dates stay `YYYY-MM-DD` without timezone conversion. IDs provide stable tiebreakers across equal dates/text. Repeated reads of unchanged data yield the same pages; concurrent commits between separate page requests may change them, so the UI permits refresh rather than promising a frozen multi-request snapshot.

### 5.3 Endpoint definitions

| Method/path | Role; allowed query | Authorization/filter and success items |
| --- | --- | --- |
| GET /api/courses | OWNER; limit, offset | Select distinct Courses for which an owned Section exists. Item: CourseSummary. Sharing a Course does not expose other owners/Sections or their counts. No owned Sections means empty collection. |
| GET /api/sections | OWNER; required courseId, limit, offset | First establish an owned Section exists for that Course; missing/foreign-only Course returns 404. Then list only owned Sections in it. Item: SectionSummary. An out-of-range page is empty, not 404. |
| GET /api/sections/:sectionId/lectures | OWNER; limit, offset | Resolve owned Section before listing. Missing/foreign Section returns 404; owned Section with no lectures returns empty. Item: LectureSummary. |
| GET /api/surveys | OWNER or RESPONDENT; limit, offset; lectureId optional for OWNER only | OWNER: all three states scoped through owned Section, optionally to an owned Lecture; a valid missing/foreign selected Lecture gives 404. RESPONDENT: reject lectureId as unsupported query, then list only Published/Closed with own eligibility. Items: OwnerSurveySummary or RespondentSurveySummary. |

Parent-selector access is checked even when pagination would produce no items. Eligible respondents do not need separate catalog endpoints because each survey carries the necessary context. There is no F-02 `GET /api/surveys/:id`: retain that path for the owning F-03 read contract.

### 5.4 Allowlisted item schemas

| Type | Exact fields |
| --- | --- |
| CourseSummary | `{ id: UUID, code: string, title: string }` |
| SectionSummary | `{ id: UUID, courseId: UUID, term: string, sectionCode: string }` |
| LectureSummary | `{ id: UUID, sectionId: UUID, title: string, lectureDate: calendarDate, sequence: positiveInteger, existingSurvey: null or SurveyRef }` |
| SurveyRef | `{ id: UUID, title: string, status: DRAFT or PUBLISHED or CLOSED, mode: IDENTIFIED }`; owner-only lecture projection. |
| OwnerSurveySummary | `{ id: UUID, title: string, status: DRAFT or PUBLISHED or CLOSED, mode: IDENTIFIED, course: CourseSummary, section: SectionSummary, lecture: LectureRef }` |
| LectureRef | `{ id: UUID, title: string, lectureDate: calendarDate, sequence: positiveInteger }` |
| RespondentSurveySummary | Same context/id/title fields as OwnerSurveySummary, but status is PUBLISHED or CLOSED, plus `participation: { submitted: boolean }`. Mode is IDENTIFIED in S1. |

All fields are non-null except `existingSurvey`. Existing Survey title follows F-03's actual stored Draft policy; F-02 must not impose publication-only validity on an incomplete Draft. S1 persisted schema/mode is IDENTIFIED; future anonymous records require the later accepted F-06 projection/disclosure contract, not silent relabelling here. Respondent title/context comes only from a visible Published/Closed survey.

Never return owner/student account IDs, owner email/displayName, enrollment/eligibility lists, other participation, response counts/means/comments, question bodies, answer/bundle IDs, source/template metadata, session/token fields or private notes. Owner summaries omit participation entirely; absence must not be serialized as a null per-student field. F-05 owns response-count/results reads. Render all persisted text escaped as plain text, including seed strings resembling markup.

### 5.5 Error contract

Errors use `{ "error": { "code": "CODE", "message": "safe text" } }`; validation may add `fields` mapping only the paths `limit`, `offset`, `courseId`, `sectionId`, `lectureId`, `_form` to safe reasons. Never echo supplied values, SQL, stack, session data or inaccessible metadata.

| Status/code | Condition and fixed outward message |
| --- | --- |
| 400 UNEXPECTED_BODY | Nonempty GET body: `This request does not accept a body.` |
| 401 AUTH_REQUIRED / SESSION_EXPIRED | F-01 exact session policy/messages; clear private UI. Not a new F-02 lifecycle. |
| 403 ORIGIN_FORBIDDEN | F-01 exact Origin policy/message; do not reclassify as empty data. |
| 403 FORBIDDEN_ROLE | Authenticated wrong role for owner context: `This operation is not available for your role.` |
| 404 NOT_FOUND | Valid-format missing or inaccessible named parent: `Resource not found.` Same status/body for both. |
| 405 METHOD_NOT_ALLOWED | Recognized context path, unsupported method: `Method not allowed.` Respect shared-path routing above. |
| 422 VALIDATION_FAILED | Invalid/missing/unknown/duplicate query or malformed UUID: `Check the request parameters.` Safe field reasons; no SQL cast error. |
| 503 AUTH_SERVICE_UNAVAILABLE | F-01 store/trusted User dependency unavailable; no fallback identity. |
| 503 SERVICE_UNAVAILABLE | Known unavailable F-02 domain database dependency: `The service is temporarily unavailable.` Never a fabricated empty/success response. |
| 500 INTERNAL_ERROR | Unexpected failure: `An unexpected error occurred.` Safe diagnostics only. |

New `UNEXPECTED_BODY` wording and all proposed wire details require shared #5/F-01 reconciliation before implementation. No mutation succeeds on error. F-02 must not log raw cookies/tokens, request bodies or broad row dumps. Safe status/route diagnostics exclude account-linked submission information.

## 6. Data model, seed and query responsibilities

| Entity | F-02 meaning / required relationship | Implementation owner |
| --- | --- | --- |
| User | Trusted UUID and OWNER/RESPONDENT role; credentials remain F-01. | F-01 defines; #16 authors one migration/seed. |
| Course | UUID, unique code, title; academic context only. | F-02/#16 coordinate exact columns/types and nonblank synthetic metadata. |
| Section | UUID; required Course FK and OWNER User FK; term/sectionCode; unique course/term/sectionCode. | #16 migration; seed/service checks owner role because a simple FK alone does not enforce it. |
| Lecture | UUID; required Section FK; title, DATE lectureDate, positive integer sequence; unique section/sequence; dates need not be unique. | #16 migration/seed. |
| Membership | Required Section and RESPONDENT User FKs; unique section/student pair. No attendance/grade fields. | #16; seed/service checks respondent role. No F-02 member CRUD. |
| Survey | Unique Lecture FK, owner matching its Section, title/status/mode. Absent survey is normal. | F-03 owns authoring/state rules; #16 coordinates constraints. F-02 reads existingSurvey/context only. |
| SurveyEligibility | Unique survey/student pair; frozen at publication. | F-03 writes atomically with publication; #16 schema; F-02 uses own-row EXISTS. |
| Participation | Unique survey/student pair referencing eligibility; status only, not answer data. | F-04 owns atomic submission writes; #16 schema; F-02 reads own-row EXISTS. |

Do not create a duplicate User, Survey, eligibility or participation schema. Agree exact Prisma/SQL field mappings, FK targets, nullability and deletion behavior in #16 before code. Academic context/membership rows are seeded/read-only to the application; do not cascade-delete submitted associations or introduce public seed/admin routes. Question/Answer definitions and response transactions remain outside F-02.

Seeds reproduce at least two owners with different Sections in the same Course, another Course, multiple lectures (including equal dates with different sequences), an owned Section with no lectures, an owner with no Sections, and students with differing Membership/eligibility. Use synthetic data only. Minimal context seed can exist before F-03/F-04; publication/participation integration fixtures are added under their reviewed schemas, not fabricated as implemented workflows. Seed roles/FKs/unique relationships are validated without requiring the login UI. Test-only Membership changes demonstrate that later enrollment changes do not rewrite published eligibility.

Queries apply authorization and selector predicates **before** count/order/offset/limit. Use distinct Course selection and EXISTS/semi-joins for eligibility/participation, not fan-out joins that duplicate survey cards or count answer rows. The count and items, parent checks and participation projection within one response use one read-only consistent database snapshot (proposed PostgreSQL REPEATABLE READ transaction; confirm pinned Prisma support under #15/#16). PostgreSQL documents the distinction between per-statement and transaction snapshots in its [transaction isolation reference](https://www.postgresql.org/docs/current/transaction-iso.html#XACT-REPEATABLE-READ); consult the pinned version during setup. No table/survey lock, eligibility rewrite or implicit seed runs on a read. Do not expose uncommitted publication snapshots or partial submissions. Pagination is consistent within a response, not frozen across subsequent HTTP requests.

Indexes start from existing PK/FK/unique needs and scoped reads: Section owner/course, Lecture section/sequence, Survey lecture/state and eligibility/participation survey/student pairs; reverse student/survey lookup may be added if query evidence justifies it. #16 owns actual index/migration decisions. This contract promises correctness and bounded pages, not an unmeasured performance result.

## 7. UI contract

Use the existing SDS cool blue/teal light theme, native labelled controls, explicit state text and semantic feedback. No new design system or dashboard is introduced. Proposed owner/respondent list route names must be aligned with F-01 shells before code; their responsibilities are fixed here even if final UI paths differ.

| State / interaction | Required behavior |
| --- | --- |
| Owner selection | Label Course, Section and Lecture; default to no selection, not an invented authorized context. Use the paginated APIs for each selector/list. Change of parent clears child selection, data and page offset. |
| Selector/list pagination | Previous/Next with page/range context and disabled boundary semantics; retain selected parent, limit and deterministic order. Reset offset to 0 on parent/lecture filter changes. Show selected labels even when another page is displayed; permit reload/reset if data changes. |
| No owned Courses | Explain no assigned teaching context; no create/admin action. |
| Owned context with no lectures/work | Distinguish no lectures from no survey for a selected lecture; only the latter offers F-03 creation when that target workflow exists. |
| No eligible surveys / out-of-range page | Neutral empty state, no fake cards/charts. For a now-empty later page, offer previous/reset navigation without automatic retry loops. |
| Respondent cards | Show Course code/title, Section/term, lecture title/date, survey title, Published/Closed, identified mode and separate own Submitted/Not submitted status. Actions follow section 4.2; no owner participation list. |
| Loading / rapid changes | Show loading text/busy state; clear unrelated child rows while fetching. Cancel or ignore superseded requests; an old parent response cannot populate a new selection. Never flash another user's/parent's cached content. |
| 401 / logout | F-01 clears private lists, selection/cache and pending request generations; return to login/session-ended state. A late successful fetch cannot restore content after logout or a user switch. |
| 403 / 404 | Safe unavailable/access message, no guessed hidden names. Clear inaccessible dependent data and allow returning to an authorized parent/list; do not mislabel as session expiry. |
| Network / 5xx | Explain read failure with an explicit retry. Do not show zero records, a successful create/submit or permanent empty state as the result of an error. |
| Stale action | The target feature rechecks authority/state. Explain its safe rejection and refresh discovery; do not retry a create/submit automatically. |
| Keyboard / responsive | Associated labels, logical Tab order and native activation; loading/error announcements and visible focus. At 360px and 1280px content/actions wrap without page overflow or color-only permission cues. Preserve ISO lecture date without browser-timezone shifts; Thai/English text wraps. |

No answer drafts or survey definitions are stored/edited by this UI. Only request-local/in-memory context is cached; clear on auth loss. F-04 owns identified-mode disclosure before answering; F-02's mode label must not contradict it or advertise anonymous support.

## 8. Stable acceptance criteria

All outcomes and linked cases are **Planned / Not run**. Full STS inputs/actions/expected results are in the companion file. Accepted IDs remain stable; append or record justified revisions rather than renumbering.

| ID | Observable outcome | Planned STS IDs |
| --- | --- | --- |
| AC-F02-01 | Reproducible synthetic hierarchy satisfies required roles/FKs/unique relationships; #16 owns its schema without duplicate auth/domain tables. | TEST-F02-I01, TEST-F02-M02 |
| AC-F02-02 | All reads require trusted F-01 identity; owner context routes reject respondents before resource detail; client actor data grants nothing. | TEST-F02-I02, TEST-F02-I03 |
| AC-F02-03 | Course list contains exactly Courses having an owned Section, once each, without cross-owner data/counts. | TEST-F02-I04 |
| AC-F02-04 | Section list requires owned Course access and returns only own Sections; missing/foreign-only parent is indistinguishable 404. | TEST-F02-I05 |
| AC-F02-05 | Lecture list requires owned Section access, supports empty Sections and exposes only the authorized existing-survey reference. | TEST-F02-I06 |
| AC-F02-06 | Owner survey list is Section-scoped across all three states; optional lecture selection cannot broaden ownership or reveal another Section's survey. | TEST-F02-I07 |
| AC-F02-07 | Respondent list includes only own-eligible Published/Closed surveys and never Draft or unrelated context. | TEST-F02-I08, TEST-F02-I09 |
| AC-F02-08 | Post-publication Membership changes do not add/remove discovery eligibility; only frozen eligibility controls it. | TEST-F02-I10 |
| AC-F02-09 | Each respondent sees only their persisted submitted boolean; another student's participation never changes it. | TEST-F02-I11, TEST-F02-H02 |
| AC-F02-10 | Exact safe projections exclude questions/answers/results/identities/session/private fields; text is plain, owner participation absent. | TEST-F02-U02, TEST-F02-I12 |
| AC-F02-11 | Exact query/UUID syntax, duplicate/unknown fields, GET bodies and deferred history filters are rejected safely without domain writes. | TEST-F02-U01, TEST-F02-I13 |
| AC-F02-12 | Pagination defaults/bounds and authorized totals are correct; empty/out-of-range pages do not expose another actor's counts. | TEST-F02-U03, TEST-F02-I14, TEST-F02-I16 |
| AC-F02-13 | Stable documented ordering/tiebreakers produce repeatable unchanged-data pages and preserve calendar dates. | TEST-F02-I15 |
| AC-F02-14 | Owner/Respondent empty/loading/availability distinctions and parent-reset/page actions match server data without invented workflow success. | TEST-F02-I16, TEST-F02-E01, TEST-F02-E02 |
| AC-F02-15 | Retry, permission/session-loss and superseded-request behavior never restores unrelated/private stale content or treats failure as empty success. | TEST-F02-E03, TEST-F02-E04 |
| AC-F02-16 | Both list journeys are labelled, keyboard-operable and usable at 360px/1280px with visible focus and wrapped content. | TEST-F02-E01, TEST-F02-E02, TEST-F02-M01 |
| AC-F02-17 | Reads leave domain data unchanged; one response's count/items/participation use a consistent committed snapshot during publication/submission. | TEST-F02-I17, TEST-F02-I18 |
| AC-F02-18 | Database/auth dependency failure produces the safe defined error, no-store and no private diagnostics, not a fabricated empty collection. | TEST-F02-I19, TEST-F02-E04 |
| AC-F02-19 | Actions derive from current state/own status; target features revalidate stale/ineligible requests; no F-03/F-04 write is implemented in F-02. | TEST-F02-U04, TEST-F02-I20, TEST-F02-H01, TEST-F02-H02 |
| AC-F02-20 | Accepted contract/STS/DoD, actual setup/test/history and substantive teammate integration are linked before claiming F-02 Done. | TEST-F02-M02 |

## 9. Verification and completion evidence

Planned verification has pure query/projection/action rules, real API/PostgreSQL authorization/relationship/pagination tests, selected UI journeys and separately owned cross-feature handoffs. A mocked list or F-01 guard harness does not prove scoped SQL or snapshot behavior. F-02 takes primary ownership of the same-Course discovery checks delegated as TEST-F01-H01 in provisional PR #29; link the actual F-02 cases/result once accepted instead of counting them twice.

Meaningful TDD targets are wrong-owner scoping before pagination, frozen eligibility versus mutable Membership, own Participation EXISTS and Draft exclusion. Retain actual intended-behavior RED/GREEN versions/output during implementation, not now. Do not invent runtime commands, framework test paths, passing counts or review links.

Before #18: obtain real opposite-member review, reconcile shared #5/F-01 conventions, pin compatible runtime/ORM under OPEN-02 and record the applicable #16 schema/seed design. Feature completion then needs implemented AC, real tests/results (including selected UI), safe setup/documentation, substantive review/integration and disclosed handoff status. Provisional Product DoD DOD-01 through DOD-10 apply within F-02's scope; DOD-11/12 remain integrated release/PDF gates. Record the accepted DoD source/version, not a fabricated adoption.

Each actual case result records requirement/feature/AC/STS, test file/name/level, command/date/environment/schema/lockfile, tested SHA, expected/observed outcome, pass/fail/skip counts and evidence reference. Distinguish manual checks and delegated H-cases from local automated execution. #22/#23 verify combined product behavior; #6 plans capture, #25 owns assessed release, #26 assembles actual evidence. This documentation task satisfies none of those application gates.

## 10. Dependencies, proposed agreements and coordinated follow-up

| Item | Owner / required agreement before affected code | Current boundary |
| --- | --- | --- |
| Shared IDs, safe errors, canonical UUID/query policy and Product DoD | Both #5 owners plus #10/#11 reviewers; reconcile accepted PR #29 or later version. | Provisional reference only; no copied shared files or human adoption. |
| Trusted auth/role/session/Origin behavior and UI shells | F-01 #10/#17 and F-02 #11/#18. | Consume F-01; no auth implementation or new session rule. |
| Academic schema, seed, collation and consistent read transaction | #16 with #11; #15 verifies pinned Prisma/PostgreSQL support. | One reviewed migration history; F-02 can use empty Survey tables before F-03 runtime exists, but cannot query absent schema. |
| Survey/ref fields and questionnaire read/management target | F-03 #12/#19 with #11; agree exact target UI routes and schema before F-02 handoff code. | F-02 returns context/reference only; F-03 owns detail/state/write/eligibility publication. |
| Participation relation and own-submission target | F-04 #13/#20 with #11. | Shared own-status meaning is EXISTS Participation; F-04 owns atomic writes/readback; H02 remains pending until real routes exist. |
| Results navigation | F-05 #14/#21 with #11. | No results/count/comment payload added to discovery. |
| Tracker's all-contract database gate | Both #5 owners / #16 coordinator, later shared-file edit. | Current tracker section 3 gates #16 on #10-#14 schema contracts; provisional PR #29 proposes staged User/session then applicable domain subsets. Agree/document sequencing; do not silently weaken either gate here. |
| Shared trace/register/index updates | Coordinated follow-up after acceptance. | Link these two files, AC/STS mappings and TEST-F01-H01 ownership later; shared files intentionally unchanged. |

F-02 contracts/test design can be reviewed now without working auth or other feature code. Runtime verification needs real F-01 and the schema/fixtures actually exercised; final end-to-end handoffs need the target features. Unresolved agreements prevent their dependent implementation, not documentation progress. Course/Section/Lecture/member CRUD, history filters, anonymous mode, templates, CSV, notes and analytics remain excluded.
