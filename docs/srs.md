# LECTRA — Software Requirements Specification

Version: 0.4 (2026-11-06). Status: consolidated planning draft with source-qualified review recommendations; not an approved or implemented baseline.
Related issue: [#1](https://github.com/Maibokdaimhai/LECTRA/issues/1).

## 1. Sources and requirement authority

| Source | Authority and use |
| --- | --- |
| `group_work_specs_v1.pdf`, Sections 5–8, Theme 10 on page 9 | Instructor requirements for the full-stack product, identity/access, survey domain, engineering process, and three sprints. The supplied master PDF is marked as a draft. |
| `project_deliverable_1_v1.pdf`, Sections 2–4 | Instructor requirements for the Sprint 1 release, Parts A–F, and assessable evidence. |
| Project owner's instructions, including 2026-11-06 clarification | Team of two; LECTRA; lecture-feedback context selected under delegated scope discretion; React/Vite/TypeScript, Vitest, PostgreSQL, Prisma ORM, Playwright; permitted additions documented in the SDS. |
| Partner's proposal in `message-3.txt` | Input for discussion, not an instructor requirement or automatic authorization to expand scope. |
| Owner-supplied `LECTRA – Product Direction and Documentation Improvements` | Direction for this revision: explicit Course → Section → Lecture context, Sprint 2 Starter Questionnaire, and Sprint 3 Teaching Improvement Notes. Requested evaluation does not constitute teammate approval of every implementation detail. |
| Owner-supplied `Final Product Baseline Revision & PR Approval Preparation` and subsequent clarification | Confirmed PD-01 anonymous raw-text non-exposure, PD-02 simplified private notes, PD-03 single-dimension starter wording. Keep workload planning proportionate. Its earlier "four Suggestions" label/temporary deferral is superseded by the source correction below. The team manages all Git/PR operations itself. |
| Owner's later correction of review provenance | Section 8 Innovation Opportunities P10/P05/P14/P15 are attributed to the teammate's Comprehensive Review `Pasted text(20261106-090722).txt` in their ChatGPT conversation. The separate Initial Review has formal suggestion REV-08. The owner's supplied descriptions are available; complete original reports are not directly accessible or confirmed repository files. These recommendations are not instructor requirements. |

IDs below describe LECTRA's proposed requirements. `I` means an instructor requirement or theme expectation; `T` means a team-specific design decision selected under the project owner's authorization. An `I + T` entry combines a required outcome with a team-selected realization. The exact thresholds, screens, stack, and feature count are not mandated by the instructor. Team review is still required before implementation contracts are accepted.

## 2. Problem, vision, and actors

LECTRA means **Lecture Evaluation, Classroom Thoughts, Reviews & Analytics**. Students need a structured way to report understanding, pacing, and unresolved questions after a lecture. Instructors need feedback soon enough to adjust the next lecture.

The primary unit is a **lecture within a section/offering of a course**, not a university-wide instructor-ranking or end-of-term evaluation program. Questions cover Course Content, Teaching Methods, Classroom Experience and General Suggestions without adding separate evaluation products. The instructor can record how they plan to act on feedback, closing the loop between collection and teaching improvement.

The canonical relationship is `Course → Section → Lecture → Survey → Results`, with one optional Teaching Improvement Note attached to a Closed survey in Sprint 3. Results are derived from valid stored answers, not an independently editable evaluation record. Cross-lecture results describe feedback on compatible questions; they do not establish an instructor's overall quality or a causal measure of teaching effectiveness.

Course-level and instructor-level feedback evaluation remains in scope through authorized, compatible per-metric summaries across lectures in the instructor's own Sections. Show the contributing lecture/question counts, weighting, context and limitations. This is different from a universal instructor score or cross-owner ranking; lecture focus does not remove meaningful broader feedback analysis.

| Actor | Responsibility |
| --- | --- |
| Survey Owner (instructor) | Own sections, create/publish/close their lecture surveys, inspect authorized results, use a starter questionnaire, and maintain their private improvement notes. |
| Respondent (student) | Access eligible surveys, submit a valid response, and inspect their own participation status. |

One account has one role. Each section has one instructor owner; a Course is academic context, not a permission boundary. Two instructors can own different sections of the same Course without gaining access to each other's surveys. Each lecture has at most one survey in the baseline. No staff administrator role or ownership delegation is included. Seed operators are setup responsibilities, not an application role with privileged answer access.

### Domain glossary

| Term | Definition and boundary |
| --- | --- |
| Course | Stable academic context such as course code/title; can have multiple offerings. Not a survey or permission grant. |
| Section / offering | A Course taught in a specific term and section code, with one owner and enrolled members. `Classroom` in earlier drafts meant this entity; no separate physical-room model is introduced. |
| Lecture | A dated teaching session in a Section; the unit evaluated by one survey. A room/location is not required. |
| Survey Owner | Application role for the instructor responsible for a Section and its surveys; no access inherited merely by sharing a Course. |
| Eligibility | Permission to answer one survey, snapshotted from a selected set of enrolled respondents at publication. |
| Participation | Whether an eligible account has submitted; distinct from answer content, particularly in anonymous mode. |
| Response bundle | One atomic set of answers to a survey. Identified bundles link to their student; anonymous bundles do not. |
| Starter Questionnaire | Versioned, seeded set of question definitions copied into a new Draft; not a live link to historical survey questions. |
| Question lineage / metric definition | Source/version provenance and an exact measurement definition used to decide whether two rating questions are comparable. A matching category/title alone is insufficient. |
| Teaching Improvement Note | One owner-private issue/action record per accessible Closed survey, with a simple Planned/Applied status; no reflection field, detailed workflow, public response or proof of effectiveness. |

## 3. Scope and exclusions

### Whole-product scope

Authentication; seeded Courses, Sections, lectures and memberships; survey lifecycle; configurable questions; eligibility; one submission per eligible student; identified and anonymous modes; participation status; aggregate analysis; owner-visible text feedback under the stated policy; versioned Starter Questionnaire and independent survey copies; aggregate CSV export; owned lecture history/compatible trends; owner-private Teaching Improvement Notes; delivery, UAT and maintenance responsibilities.

### Sprint 1 scope

Identified surveys; rating and text questions; manual publication and closing; eligibility snapshot from seeded Section membership; immutable published structure; one immutable submission per student; own identified response retrieval; aggregate count/mean/distribution and text feedback visible to the owner after closing. Courses/Sections/lectures are seeded read-only context, not administration screens. No template or note workflow is required in Sprint 1. See [features](features.md) for allocation.

### Explicit exclusions

Attendance, grades, homework, LMS workflows, university integrations, registration/recovery/verification flows, SSO, co-teaching, delegated staff access, instructor rankings, cross-instructor dashboards, notifications, scheduled opening/closing, AI text analysis, PDF data export, discussions, template-authoring administration and student-visible improvement notes. Product demonstration data is synthetic. CSV export, anonymous mode, the Starter Questionnaire and private improvement notes remain in scope. Shared notes are a deferred proposal requiring explicit scope/privacy agreement, not an implemented toggle.

## 4. Functional requirements

| ID | Requirement | Origin |
| --- | --- | --- |
| FR-01 | Users can log in, retrieve their current identity and role, and log out using a documented server-side session lifecycle. | I |
| FR-02 | Instructors can navigate seeded Course → owned Section → Lecture contexts; students can discover only Published or Closed surveys in their eligibility snapshot. Sharing a Course grants no access to another Section. | I + T |
| FR-03 | An instructor can create and edit a Draft survey and its ordered rating/text questions for an owned lecture. | I + T |
| FR-04 | The owner can publish a valid Draft and close a Published survey. The UI shows the resulting persisted state. | I + T |
| FR-05 | An eligible student can submit a complete validated response to a Published survey and receive a persisted confirmation. | I |
| FR-06 | A student can retrieve their own submission status, including after logout/login. For identified surveys, they can reopen their own submitted answers. Anonymous surveys expose status only. | I + T |
| FR-07 | A survey owner can view response count and authorized per-question quantitative results. Individual text responses without respondent labels are available only for identified surveys after closure; anonymous raw text is never exposed to owners through any result surface. Owners cannot retrieve respondent-linked answers. | I + T |
| FR-08 | The owner can select identified or anonymous mode before publication. Anonymous submission separates participation identity from stored answers, suppresses raw text and applies question-level quantitative privacy controls under a documented/tested design. Anonymous text collection/storage is an explicit pre-F-06 decision, not implicitly enabled. | I + T |
| FR-09 | The owner can add single-choice questions, duplicate an owned survey into a new Draft for another owned lecture without a survey, and select an eligible subset of Section members before publication. | T |
| FR-10 | The owner can export authorized aggregate results as CSV, observing the same privacy and visibility rules as result APIs. | I + T |
| FR-11 | The owner can filter history by Course, Section, lecture date and state, inspect compatible Closed-lecture trends, and evaluate Course/own-instructor feedback through labelled per-metric summaries of visible questions. No cross-owner access, pooling of hidden data or universal instructor ranking is allowed. | T |
| FR-12 | Setup can reproduce synthetic accounts, Courses, Sections, membership and lectures, and initialize/version the database without real secrets. Later seeds also reproduce the versioned Starter Questionnaire and note/trend test contexts. | I + T |
| FR-13 | In Sprint 2, an owner can preview a published Starter Questionnaire version and copy it into a new Draft for an owned lecture, then edit/add/remove/reorder questions and required flags before publication without changing the source or other surveys. | T |
| FR-14 | In Sprint 3, the owner can create, retrieve and edit one private Teaching Improvement Note per Closed survey with available results, recording interpreted issues, planned actions and Planned/Applied status. Students and other owners cannot access it. | T |

## 5. Business rules

| ID | Observable rule | Origin |
| --- | --- | --- |
| BR-01 | Protected operations require an authenticated server-resolved identity; client-supplied role/owner/student IDs never grant permission. | I |
| BR-02 | Respondents cannot manage surveys or inspect another student's answers. Owners cannot access/manage another owner's surveys/results. | I |
| BR-03 | A student's eligibility is frozen from the selected Section-member set at publication. Later membership changes do not silently modify that survey's eligibility. | I + T |
| BR-04 | Valid transitions are Draft → Published → Closed. No reopening is supported. Respondents cannot discover Draft content. | I + T |
| BR-05 | Only Published surveys accept responses. Publication requires 1–10 valid questions including at least one rating or single-choice question, a nonblank title, and at least one eligible student. | I + T |
| BR-06 | Each eligible student can submit at most once per survey, including concurrent requests. A rejected duplicate creates no second response. | I + T |
| BR-07 | Required answers must be present; required text must contain non-whitespace content. Ratings are integers 1–5. Text is at most 2,000 Unicode code points. Unknown, duplicate or wrong-survey question IDs and wrong-type answers are rejected. A submission must contain at least one nonempty valid answer even if all questions are optional. | I + T |
| BR-08 | A response is atomic: either participation and all valid answers commit, or no part is retained. | T |
| BR-09 | Question structure/order, required flags, eligibility and privacy mode are immutable after publication. A new evaluation requires a new survey for another lecture or an explicit future approved scope change. | T |
| BR-10 | Submitted answers cannot be edited, withdrawn or resubmitted in the baseline. Drafts may be deleted; Published/Closed surveys and submitted responses are not hard-deleted through the application. | T |
| BR-11 | Closing and submitting have a database-defined order. If closing acquires the survey transaction lock and commits first, the submission is rejected; if a submission commits first, it is included in the closed survey. | T |
| BR-12 | The mean uses answered ratings for that question only, excludes missing optional answers, and displays two decimal places. No answers produces a null mean and an explicit no-data state, not zero. Distribution includes counts for each score 1–5. | T |
| BR-13 | While Published, the owner sees only the survey response count. After closure, identified results have no minimum-count suppression. For anonymous data, raw text is never owner-visible and each quantitative question independently requires at least five valid nonempty answers; a proposed sparse-distribution guard additionally requires every nonzero rating/option bin to contain at least three answers. Otherwise suppress that question's entire numeric result, including its mean, distribution and answered count, across UI/API/export/analytics. A survey-level count of five does not release a sparsely answered question or guarantee anonymity. | T |
| BR-14 | Before answering, students see the privacy mode and a truthful disclosure. Identified answers remain linked to the account in storage even though the owner UI/API omits the link. Anonymous mode must not be advertised or enabled until its design and verification are accepted. | I + T |
| BR-15 | Anonymous participation records cannot store an answer-bundle ID, and answer records cannot store user/eligibility/session IDs or precise per-submission timestamps. Logs and exports must not reintroduce an application-visible join. Remaining infrastructure/backup risks are disclosed. | I + T |
| BR-16 | Aggregate CSV excludes names, account IDs, participation lists, individual answers, text comments and private notes. Text feedback is readable only for identified surveys in the authorized results view. Anonymous raw text is omitted from every owner API, UI, CSV and analytics path regardless of response count. Single-choice summaries report option counts, not a numeric mean, subject to BR-13. | T |
| BR-17 | Applying a starter or copying a survey creates new Survey/Question/Option IDs in one transaction from one consistent source version/revision, copying definitions only with provenance. A concurrent change to an expected mutable source revision causes a conflict rather than a mixed copy. No eligibility snapshot, participation, response, result or note is copied; source changes never update copies. | T |
| BR-18 | Cross-lecture rating comparisons require the same immutable metric-definition version, question meaning/type, 1–5 anchors and interpretation. Editing the measured wording/type/anchors clears inherited comparability. Shared category, template origin or owner-entered title alone is insufficient. | T |
| BR-19 | Trends/summaries include only owned, compatible Closed-survey question results already releasable under BR-13. Show per-lecture counts where permitted. Course/own-instructor summaries are per metric and response mode, with answer-weighted sum/count, contributing-lecture count and context labels; repeated students across lectures are answer observations, not unique people. Never pool hidden questions, infer anonymous text or compute an unlabelled mean of means. | T |
| BR-20 | Notes may be created only for an owned Closed survey with accessible results; an anonymous survey requires at least one releasable quantitative question. Enforce one private note per survey under concurrent creates. No respondent, other owner, CSV export or analytics payload receives note content. | T |
| BR-21 | A note has required issue summary and planned improvement, each 1–2,000 Unicode code points after trimming, and Planned/Applied status. Default to Planned; either valid status can be selected on edit without reflection, reversal reason or workflow prerequisites. Keep createdAt, updatedAt and current appliedAt only; Applied is the instructor's recorded status, not proof of effectiveness. | T |
| BR-22 | Note updates use an integer revision precondition; stale edits conflict rather than overwrite. Update note/status/timestamps and revision atomically. No detailed status-history entity, transition audit or automatic raw-feedback copy is included. Survey data/results remain unchanged. | T |
| BR-23 | A survey must belong to a lecture in the owner's Section; one survey per lecture is enforced even under concurrent creation/copy requests. Starter availability and note completion never gate the core Sprint 1 publish/answer workflow. | T |

Optional blank text is normalized to no answer; omitted optional questions are excluded from that question's answered denominator. Omit unanswered optional fields rather than submitting a fabricated score or empty typed value. The response count counts submitted students, not answer rows. Draft titles are limited to 120 and question prompts to 500 Unicode code points. Single-choice has 2–6 nonblank, distinct option labels of up to 120 code points and exactly one selected option when answered. A survey requires at least one rating or single-choice question to support a numeric/count summary. Survey limits and privacy thresholds are team choices, not instructor-specified values.

F-04 request sizing must accommodate bounded escaped JSON as well as UTF-8: at most ten answers, 2,000 Unicode code points per text answer and a proposed 256 KiB encoded-body ceiling. Ten texts encoded as surrogate-pair escapes require up to 240,000 bytes before a bounded envelope. Enforce decoded answer/count limits independently and reject oversized bodies before persistence. Arbitrarily padded or unusually escaped JSON can still exceed the transport limit; the baseline does not promise to accept every serialization of the same values. Issue #5 finalizes the exact envelope, parser settings and boundary cases (BASE-03).

### State and workflow boundaries

| State | Owner operations | Respondent operations | Results / notes |
| --- | --- | --- | --- |
| Draft | Read/edit/delete; publish after validation; choose starter only when creating a new Draft. | Cannot discover/read/answer. | No results or notes. |
| Published | Read frozen structure; close manually. | Eligible: read, submit once, inspect own status/identified answers. | Owner count only; no text/rating results, exports or notes. |
| Closed | Read; no reopen, edit-structure or delete. | Eligible: read frozen questionnaire, own status/identified answers; cannot submit. | Owner results subject to privacy threshold; export S2; private note S3 when results visible. |

Normal paths must persist through UI → API → PostgreSQL; role rejection, invalid transitions and concurrency failures leave authoritative data unchanged. A successful browser message alone is not proof of completion.

### Starter Questionnaire working content (Sprint 2)

One seeded starter, `lecture-feedback`, version `1`, is sufficient. It is an application-provided starting point, not a university-validated psychometric instrument or mandatory survey. Owners may create a blank Draft instead.

| Category | Initial question | Type / required | Scale meaning |
| --- | --- | --- | --- |
| Course Content | How clear was the content presented in this lecture? | Rating / required | 1 Not clear → 5 Very clear; clarity of lecture content only. |
| Teaching Methods | How effective were the instructor's explanations? | Rating / required | 1 Not effective → 5 Very effective; effectiveness of explanations only. |
| Classroom Experience | How suitable was the learning environment for this lecture? | Rating / optional | 1 Not suitable → 5 Very suitable; learning environment only. |
| General Suggestions | What is one thing that could be improved in a future lecture? | Text / optional in identified surveys | No numeric score. Anonymous collection remains OPEN-04. |

This content is a team design starting point. Required-flag changes are permitted before publication but affect response completeness and must be shown with trend denominators. A pacing question, if authored, must explain whether 1/5 mean slow/fast or unsuitable/suitable; higher is not automatically better.

## 6. Non-functional requirements and verification targets

Targets below are selected for this project and remain unverified until execution evidence exists.

| ID | Target | Verification and sprint |
| --- | --- | --- |
| NFR-01 | Every protected operation rejects unauthenticated requests and unauthorized role/ownership access without private data; no plaintext passwords in storage or logs. | API/database access matrix tests and credential-storage inspection, Sprint 1; extend/regress each sprint. |
| NFR-02 | No committed survey/answer is lost across application restart. Concurrent duplicate submissions produce exactly one stored response; close/submit follows BR-11. | Real PostgreSQL integration tests and restart retrieval, Sprint 1; redeployment persistence in Lab 5. |
| NFR-03 | A fresh checkout with documented prerequisites can migrate, seed, build and run using documented commands and example configuration; no real secret is committed. | Teammate reproduction on a clean database and secret/configuration review, Sprint 1; Docker/CI/GCP reproduction in Lab 5. |
| NFR-04 | For 30 concurrent synthetic users with 10-question surveys and 1,000 stored responses, summary reads and submissions have p95 ≤ 1 second excluding network transit and password hashing, with no unexpected server errors. | Repeatable load run recording hardware, dataset and command, Sprint 3. This is a planning target, not a measured claim. |
| NFR-05 | Every Sprint 1 AC maps to a planned test/check and actual result; important logic has unit tests, persistence/access has real integration tests, and critical journeys have selected E2E tests. | Contract/traceability audit plus recorded release test runs, Sprint 1 onward. No invented coverage percentage. |
| NFR-06 | Anonymous owner-facing UI/API/CSV/analytics expose no raw text, identity-answer join or suppressed question statistics. Independently verify question-answer threshold, optional/sparse responses and distribution/complement risks; survey count is not sufficient. | Privacy design review, schema/log/projection/export tests and adversarial small-group cases, Sprint 2; regression in Sprint 3. No anonymity guarantee against infrastructure observation or external knowledge. |
| NFR-07 | Core login, create/publish, respond and summary journeys work using keyboard navigation at 360px and 1280px viewport widths, with associated field labels and visible validation/error states. | Selected UI/E2E plus documented manual checks, Sprint 1 basic journeys; regression Sprint 3. |
| NFR-08 | Release evidence identifies the tested commit, command, pass/fail/skip counts and relevant test names; accepted releases follow teammate-reviewed staging and main PRs. | Evidence audit Sprint 1; required CI quality gates, Docker and repeatable GCP release delivery in Lab 5 and maintained afterward. |
| NFR-09 | A template revision or customization of one Draft cannot change another survey's persisted questions/options/answers. Owners may still customize that Draft before publication; published snapshots remain immutable. Note writes do not alter survey/results, and concurrent note edits cannot silently overwrite. | Real DB copy-isolation and note revision/uniqueness/transaction tests, Sprint 2 and Sprint 3 respectively. |

## 7. Privacy policy for this baseline

Sprint 1 is identified. Students may reopen their own answers; owners receive no identity-linked response endpoint or list of who submitted. Owners can read individual text responses after closure without names, IDs or submission timestamps. Text can still identify its author through its contents, and a small class can make aggregate feedback identifiable. The disclosure must explain this; omitting names is not anonymous mode.

Anonymous mode protects against Survey Owners and ordinary application users. The current planned boundary does not claim resistance to a database/infrastructure operator observing transactions, request timing or backups. Authentication still controls eligibility and participation without attaching identity to the answer bundle. Detailed linkability controls and residual risks are a blocking design gate before F-06 implementation. No per-user receipt identifier is a join to an anonymous answer bundle; own status must not recover the answers.

Text feedback is untrusted plain text. Owners must not paste identifying student details or verbatim sensitive feedback into improvement notes. The initial note feature is private; it does not publish student feedback or communicate with students. Shared visibility is a proposal, not a confirmed requirement. Adding it would require redaction rules, audience/eligibility policy, independent student-visible content and tests, and an explicit scope decision. Notes can be entered manually; no AI analysis or automatic quote transfer is included.

PD-01 is confirmed: anonymous raw text is never disclosed to Survey Owners, even at high counts. This applies to direct responses, comments lists, CSV, analytics, previews and indirect note prefill. The exact collection/storage policy is still open:

| Candidate policy | Value / trade-off | Required agreement before F-06 |
| --- | --- | --- |
| Disable text in anonymous MVP | Recommended simpler option: avoids collecting data the owner cannot use and reduces sensitive storage. The four-category starter must warn about its text question; require explicit removal/conversion before anonymous publication, never silently drop required content. | Team explicitly accepts text prohibition, author/respondent messages and backend rejection tests. |
| Collect but never expose text to owners | Preserves a potential future use but adds storage/retention/access obligations without current owner value. No raw text in any owner payload or log; inaccessible does not mean deleted or anonymous by itself. | Team defines a purpose, retention/deletion policy, storage access boundary and tests; no hidden administrator viewer is added by assumption. |

Neither option is silently selected by this document. Anonymous publication/collection must remain disabled until OPEN-04 resolves the choice explicitly. Identified text remains in Sprint 1 unchanged. Quantitative privacy controls remain necessary whichever text policy is selected.

For each anonymous rating or choice question, the working threshold is **five valid answered responses**, independently of survey participation. Additionally propose a **minimum nonzero bin count of three**; if it fails, hide the entire question's numeric projection rather than exposing complementary cells or the mean. Return only question metadata and a generic suppression label for hidden questions, not its exact answered count. Finalize/validate this practical guard in the F-06 contract; it is a project choice, not an instructor mandate or mathematical anonymity guarantee. Do not offer response-subgroup filtering, arbitrary participant slices or cross-question joins.

Result counts are not grade/attendance measures. Broader Course/own-instructor feedback uses visible compatible per-metric observations, never another owner's Section or suppressed data. External knowledge, unanimous responses and repeated observations can still enable inference; explain these limits rather than promising anonymity based on one threshold.

Synthetic data only will be used for course demonstrations. No real student deployment is authorized by this document. Automated retention/deletion, account erasure and backup purging are not promised by the baseline; a real-data rollout would require an approved policy and implemented verification first.

## 8. Assumptions, decisions, and change control

See [decision log](decisions.md) for rationale and open decisions. Both students must review this draft and record actual review evidence. Later changes must update affected requirements, features, contracts and tests rather than silently shrinking scope.

No implementation, passing test, deployment, teammate approval or completion of Issue #1 is claimed by this document.

## 9. Use cases, limitations and implementation readiness

| Scenario | Expected boundary | Features |
| --- | --- | --- |
| Owner creates and publishes lecture survey | Select owned Course/Section/Lecture; validate Draft; publication freezes definitions and eligible members. | F-01–03 |
| Student answers and returns later | Resolve identity on server; eligibility/state/answer validation; commit once; persisted own record is retrievable in identified mode. | F-01–04 |
| Owner reviews a Closed survey | Correct aggregate denominators and privacy; no respondent-linked records; no access to another Section owner. | F-05 |
| Owner starts from questionnaire | Preview version; copy definitions to a new owned Draft; customize without modifying source or historical surveys. | F-07 |
| Owner reviews compatible lectures | Closed visible own surveys only; comparable metrics and denominators; no ranking or pooling hidden results. | F-09 |
| Owner records improvement | Accessible Closed results; one private issue/action note, simple status/essential timestamps and optimistic edits; no student disclosure/history workflow. | F-10 |

Unverified assumptions: synthetic demonstration only, stable seeded membership/account set, one owner per Section, one survey per lecture, no owner transfer or grading policy, and sufficient time for the bounded roadmap. Operational database-admin access is outside ordinary application roles and the anonymous threat boundary. Resolve changing course notices and resource access with instructor/TA when applicable.

Before implementation: review this product baseline, assign real student responsibilities, version the relevant feature design/UI/API/data contract and AC/STS/DoD, then implement meaningful rules with TDD. Later-sprint contract details may remain open until their implementation gate; missing runtime evidence must remain explicit. See [baseline review](baseline-review.md) for the documentation audit and remaining gates.

Review recommendations are individually dispositioned without automatically becoming new requirements: Keep P10 categorized starter and P05 consistent-question series within existing F-07/F-09; Simplify P14 to private F-10 and defer optional sharing; Incorporate P15 as bounded usability evaluation in SYS-04/S3 supporting existing user goals. No new product feature, quantitative NFR or instructor obligation is created. REV-08 is a separate process recommendation to make decisions/rationale/gates explicit before contracts. Full original-report verification remains OPEN-11; no claim of directly reading the teammate's report is made.
