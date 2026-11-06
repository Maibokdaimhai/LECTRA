# LECTRA — Software Requirements Specification

Version: 0.1 (2026-11-06). Status: working draft for team review; not an approved or implemented baseline.
Related issue: [#1](https://github.com/Maibokdaimhai/LECTRA/issues/1).

## 1. Sources and requirement authority

| Source | Authority and use |
| --- | --- |
| `group_work_specs_v1.pdf`, Sections 5–8, Theme 10 on page 9 | Instructor requirements for the full-stack product, identity/access, survey domain, engineering process, and three sprints. The supplied master PDF is marked as a draft. |
| `project_deliverable_1_v1.pdf`, Sections 2–4 | Instructor requirements for the Sprint 1 release, Parts A–F, and assessable evidence. |
| Project owner's instructions, including 2026-11-06 clarification | Team of two; LECTRA; lecture-feedback context selected under delegated scope discretion; React/Vite/TypeScript, Vitest, PostgreSQL, Prisma ORM, Playwright; permitted additions documented in the SDS. |
| Partner's proposal in `message-3.txt` | Input for discussion, not an instructor requirement or automatic authorization to expand scope. |

IDs below describe LECTRA's proposed requirements. `I` means an instructor requirement or theme expectation; `T` means a team-specific design decision selected under the project owner's authorization. An `I + T` entry combines a required outcome with a team-selected realization. The exact thresholds, screens, stack, and feature count are not mandated by the instructor. Team review is still required before implementation contracts are accepted.

## 2. Problem, vision, and actors

LECTRA means **Lecture Evaluation, Classroom Thoughts, Reviews & Analytics**. Students need a structured way to report understanding, pacing, and unresolved questions after a lecture. Instructors need feedback soon enough to adjust the next lecture.

The primary unit is a **lecture within a classroom/section**, not a university-wide instructor-ranking or end-of-term evaluation program. Questions may address content, teaching, classroom experience, and suggestions without adding separate evaluation workflows.

| Actor | Responsibility |
| --- | --- |
| Survey Owner (instructor) | Own classrooms, create/publish/close their surveys, and inspect authorized aggregate results and permitted text feedback. |
| Respondent (student) | Access eligible surveys, submit a valid response, and inspect their own participation status. |

One account has one role. Each classroom has one instructor owner. Each lecture has at most one survey in the baseline. No staff administrator role or ownership delegation is included. Seed operators are setup responsibilities, not an application role with privileged answer access.

## 3. Scope and exclusions

### Whole-product scope

Authentication; seeded classrooms, lectures and memberships; survey lifecycle; configurable questions; eligibility; one submission per eligible student; identified and anonymous modes; participation status; aggregate analysis; owner-visible text feedback under the stated policy; aggregate CSV export; lecture history/filtering; delivery, UAT and maintenance responsibilities.

### Sprint 1 scope

Identified surveys; rating and text questions; manual publication and closing; eligibility snapshot from seeded classroom membership; immutable published structure; one immutable submission per student; own identified response retrieval; aggregate count/mean/distribution and text feedback visible to the owner after closing. See [features](features.md) for allocation.

### Explicit exclusions

Attendance, grades, homework, LMS workflows, university integrations, registration/recovery/verification flows, SSO, co-teaching, delegated staff access, instructor rankings, cross-instructor dashboards, notifications, scheduled opening/closing, AI text analysis, and PDF data export. Product demonstration data is synthetic. CSV export and anonymous mode remain in scope for later sprints.

## 4. Functional requirements

| ID | Requirement | Origin |
| --- | --- | --- |
| FR-01 | Users can log in, retrieve their current identity and role, and log out using a documented server-side session lifecycle. | I |
| FR-02 | Instructors can select only owned classroom/lecture contexts; students can discover only published or closed surveys in their eligibility snapshot. | I + T |
| FR-03 | An instructor can create and edit a Draft survey and its ordered rating/text questions for an owned lecture. | I + T |
| FR-04 | The owner can publish a valid Draft and close a Published survey. The UI shows the resulting persisted state. | I + T |
| FR-05 | An eligible student can submit a complete validated response to a Published survey and receive a persisted confirmation. | I |
| FR-06 | A student can retrieve their own submission status, including after logout/login. For identified surveys, they can reopen their own submitted answers. Anonymous surveys expose status only. | I + T |
| FR-07 | A survey owner can view response count, per-rating-question mean and distribution, and individual text responses without respondent labels. Owners cannot retrieve respondent-linked answers through the application. | I + T |
| FR-08 | The owner can select identified or anonymous mode before publication. Anonymous submission separates participation identity from stored answers under a documented and tested privacy design. | I + T |
| FR-09 | The owner can add single-choice questions, duplicate a survey into a new Draft, and select an eligible subset of classroom members before publication. | T |
| FR-10 | The owner can export authorized aggregate results as CSV, observing the same privacy and visibility rules as result APIs. | I + T |
| FR-11 | The owner can filter owned survey history by classroom, lecture date and state, and inspect rating trends only for explicitly compatible questions/scales. | T |
| FR-12 | Setup can reproduce synthetic accounts, classroom membership and lectures, and initialize/version the database without real secrets. | I + T |

## 5. Business rules

| ID | Observable rule | Origin |
| --- | --- | --- |
| BR-01 | Protected operations require an authenticated server-resolved identity; client-supplied role/owner/student IDs never grant permission. | I |
| BR-02 | Respondents cannot manage surveys or inspect another student's answers. Owners cannot access/manage another owner's surveys/results. | I |
| BR-03 | A student's eligibility is frozen from the selected classroom-member set at publication. Later membership changes do not silently modify that survey's eligibility. | I + T |
| BR-04 | Valid transitions are Draft → Published → Closed. No reopening is supported. Respondents cannot discover Draft content. | I + T |
| BR-05 | Only Published surveys accept responses. Publication requires 1–10 valid questions, a nonblank title, and at least one eligible student. | I + T |
| BR-06 | Each eligible student can submit at most once per survey, including concurrent requests. A rejected duplicate creates no second response. | I + T |
| BR-07 | Required answers must be present; required text must contain non-whitespace content. Ratings are integers 1–5. Text is at most 2,000 Unicode code points. Unknown, duplicate or wrong-survey question IDs and wrong-type answers are rejected. | I + T |
| BR-08 | A response is atomic: either participation and all valid answers commit, or no part is retained. | T |
| BR-09 | Question structure/order, required flags, eligibility and privacy mode are immutable after publication. A new evaluation requires a new survey for another lecture or an explicit future approved scope change. | T |
| BR-10 | Submitted answers cannot be edited, withdrawn or resubmitted in the baseline. Drafts may be deleted; Published/Closed surveys and submitted responses are not hard-deleted through the application. | T |
| BR-11 | Closing and submitting have a database-defined order. If closing acquires the survey transaction lock and commits first, the submission is rejected; if a submission commits first, it is included in the closed survey. | T |
| BR-12 | The mean uses answered ratings for that question only, excludes missing optional answers, and displays two decimal places. No answers produces a null mean and an explicit no-data state, not zero. Distribution includes counts for each score 1–5. | T |
| BR-13 | While Published, the owner sees only the response count. Rating/text results become visible after closing. Identified results have no minimum-count suppression. Anonymous results/exports require at least five submitted responses; below that threshold only the count is visible. | T |
| BR-14 | Before answering, students see the privacy mode and a truthful disclosure. Identified answers remain linked to the account in storage even though the owner UI/API omits the link. Anonymous mode must not be advertised or enabled until its design and verification are accepted. | I + T |
| BR-15 | Anonymous participation records cannot store an answer-bundle ID, and answer records cannot store user/eligibility/session IDs or precise per-submission timestamps. Logs and exports must not reintroduce an application-visible join. Remaining infrastructure/backup risks are disclosed. | I + T |
| BR-16 | Aggregate CSV excludes names, account IDs, participation lists, individual answers and text comments. Text feedback is readable only in the authorized results view under BR-13. Single-choice summaries report option counts; they do not invent a numeric mean. | T |

Optional blank text is normalized to no answer; optional questions are omitted from the answered denominator. The response count counts submitted students, not answer rows. Draft titles are limited to 120 characters and question prompts to 500 Unicode code points. Survey question limits and privacy thresholds are team decisions, not instructor-specified values.

## 6. Non-functional requirements and verification targets

Targets below are selected for this project and remain unverified until execution evidence exists.

| ID | Target | Verification and sprint |
| --- | --- | --- |
| NFR-01 | Every protected operation rejects unauthenticated requests and unauthorized role/ownership access without private data; no plaintext passwords in storage or logs. | API/database access matrix tests and credential-storage inspection, Sprint 1; extend/regress each sprint. |
| NFR-02 | No committed survey/answer is lost across application restart. Concurrent duplicate submissions produce exactly one stored response; close/submit follows BR-11. | Real PostgreSQL integration tests and restart retrieval, Sprint 1; redeployment persistence in Lab 5. |
| NFR-03 | A fresh checkout with documented prerequisites can migrate, seed, build and run using documented commands and example configuration; no real secret is committed. | Teammate reproduction on a clean database and secret/configuration review, Sprint 1; Docker/CI/GCP reproduction in Lab 5. |
| NFR-04 | For 30 concurrent synthetic users with 10-question surveys and 1,000 stored responses, summary reads and submissions have p95 ≤ 1 second excluding network transit and password hashing, with no unexpected server errors. | Repeatable load run recording hardware, dataset and command, Sprint 3. This is a planning target, not a measured claim. |
| NFR-05 | Every Sprint 1 AC maps to a planned test/check and actual result; important logic has unit tests, persistence/access has real integration tests, and critical journeys have selected E2E tests. | Contract/traceability audit plus recorded release test runs, Sprint 1 onward. No invented coverage percentage. |
| NFR-06 | Anonymous owner APIs, exports, application logs and answer storage contain no application-level identity-to-answer join; results follow the five-response threshold. | Privacy design review, schema/log/API/export tests and adversarial small-group checks, Sprint 2; regression in Sprint 3. This does not promise anonymity against privileged infrastructure observation. |
| NFR-07 | Core login, create/publish, respond and summary journeys work using keyboard navigation at 360px and 1280px viewport widths, with associated field labels and visible validation/error states. | Selected UI/E2E plus documented manual checks, Sprint 1 basic journeys; regression Sprint 3. |
| NFR-08 | Release evidence identifies the tested commit, command, pass/fail/skip counts and relevant test names; accepted releases follow teammate-reviewed staging and main PRs. | Evidence audit Sprint 1; required CI quality gates, Docker and repeatable GCP release delivery in Lab 5 and maintained afterward. |

## 7. Privacy policy for this baseline

Sprint 1 is identified. Students may reopen their own answers; owners receive no identity-linked response endpoint or list of who submitted. Owners can read individual text responses after closure without names, IDs or submission timestamps. Text can still identify its author through its contents, and a small class can make aggregate feedback identifiable. The disclosure must explain this; omitting names is not anonymous mode.

Anonymous mode protects against Survey Owners and ordinary application users. The current planned boundary does not claim resistance to a database/infrastructure operator observing transactions, request timing or backups. Authentication still controls eligibility and participation without attaching identity to the answer bundle. Detailed linkability controls and residual risks are a blocking design gate before F-06 implementation.

Synthetic data only will be used for course demonstrations. No real student deployment is authorized by this document. Automated retention/deletion, account erasure and backup purging are not promised by the baseline; a real-data rollout would require an approved policy and implemented verification first.

## 8. Assumptions, decisions, and change control

See [decision log](decisions.md) for rationale and open decisions. Both students must review this draft and record actual review evidence. Later changes must update affected requirements, features, contracts and tests rather than silently shrinking scope.

No implementation, passing test, deployment, teammate approval or completion of Issue #1 is claimed by this document.
