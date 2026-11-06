# LECTRA — Decision Log

Version: 0.1 (2026-11-06). Status: working draft; actual teammate review is pending.

`Selected` means selected by the project owner or under their explicit delegation. It does not mean both students have reviewed it or that implementation is authorized. Entries below are project choices, not instructor requirements unless explicitly stated.

| ID | Status | Decision and rationale |
| --- | --- | --- |
| DEC-01 | Selected | Focus on feedback after each lecture. The owner delegated selection of the most suitable Theme 10 context on 2026-11-06; this keeps a complete survey workflow while controlling scope. Content/teaching/classroom questions are categories, not separate evaluation products. |
| DEC-02 | Selected | Instructor and student roles; one owner per classroom; no delegated staff access or multi-role accounts. Use seeded contexts/accounts to avoid administration scope. |
| DEC-03 | Selected | Keep React, Vite, TypeScript, Vitest, PostgreSQL, Prisma ORM and Playwright from the team's stated experience. Add Node.js/Express, express-session/connect-pg-simple, Argon2, Zod and Supertest for missing backend responsibilities. Exact compatible versions are selected and locked during authorized setup. |
| DEC-04 | Selected | Modular monolith with one API and one PostgreSQL database; same-origin browser/API delivery. Microservices and separate staging infrastructure are unnecessary for this scope. |
| DEC-05 | Selected | Draft → Published → Closed; manual close, no reopen; freeze structure/mode/eligibility after publication; no submitted-answer editing. |
| DEC-06 | Selected | Sprint 1 uses identified rating/text surveys. Owners see count during collection and results after closure, including text without identity labels. Students can reopen only their own identified answers. This remains identified data in storage. |
| DEC-07 | Selected | Freeze eligibility at publication from classroom members. Enforce unique participation and atomic response writes in PostgreSQL; serialize closing/submission on the survey row. |
| DEC-08 | Selected | Anonymous mode in Sprint 2; owner/application-user threat boundary, no claim against privileged infrastructure observation. Suppress anonymous results/text/export below five responses. Detailed privacy design must pass a preimplementation gate. |
| DEC-09 | Selected | CSV aggregate export only; no raw-answer/text export. Single-choice, duplicate-to-Draft and eligible-subset controls are bounded Sprint 2 expansion. No instructor ranking, scheduling or AI insights. |
| DEC-10 | Selected | Survey limit 1–10 questions; ratings integer 1–5; text ≤ 2,000 code points; title ≤ 120 and prompt ≤ 500. Required text rejects whitespace-only input. These limits keep validation and tests finite. |
| DEC-11 | Selected | Preserve the empty initial README until a separate authorized documentation change; prepare this documentation on `docs/1-4-product-baseline` from `staging`. On 2026-11-06, the project owner explicitly authorized committing/pushing these documents and opening a PR into `staging`. Merge and implementation remain outside that authorization. |

## Open items and gates

| ID | Owner | Required resolution | Gate |
| --- | --- | --- | --- |
| OPEN-01 | Both students | Review selected scope/rules/privacy and record substantive feedback; names/IDs and actual work allocation are not supplied yet. | Before accepting contracts and assigning implementation work. |
| OPEN-02 | Feature implementer + teammate | Pin mutually compatible Node, package and PostgreSQL versions; verify Prisma generation/migration/transaction API and Argon2 runtime support. Do not copy version-dependent APIs from an unrelated version. | Before dependency installation and F-01/F-02 implementation. |
| OPEN-03 | Both students, instructor/TA if needed | Confirm no later course notice supersedes the supplied draft specification or deadlines. | Before assessed submission. |
| OPEN-04 | Both students | Elaborate anonymous storage, batch/order/timing/log controls, exact owner-visible metadata and residual risks; verify identity/answer separation against the declared threat boundary. | Before enabling or implementing F-06 submission behavior. |
| OPEN-05 | Team with Lab 5 guidance | Confirm actual GCP resources/permissions and secret handoff. Proposed Cloud Run/Cloud SQL components are architecture choices, not provisioned infrastructure. | Before cloud deployment. |
| OPEN-06 | Both students + instructor/TA | Agree the maintenance change for Lab 7 against already implemented behavior. Do not invent approval or treat planned baseline expansion as the approved change. | Before Lab 7 change implementation. |

## Revision record

| Date | Version | Change | Evidence status |
| --- | --- | --- | --- |
| 2026-11-06 | 0.1 | Initial planning draft for Issues #1–#4 using the two supplied PDFs and owner's delegated scope/stack instruction; authorized for commit, push and PR submission. | Planning documents only; teammate review pending; no implementation or test execution claimed. |
