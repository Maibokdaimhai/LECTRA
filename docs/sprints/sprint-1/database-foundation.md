# Issue #16 — Sprint 1 database foundation

Design recorded 2026-11-08 before implementation. Scope: persistence only; no F-01–F-05 workflow or endpoint is implemented here. Sources: [shared contract](shared-contract.md), [F-01 §4](f-01-authentication.md), [F-02 §6](f-02-context-discovery.md), [F-03 §§6–7](f-03-survey-authoring.md), [F-04 §§4–5](f-04-responses.md), [F-05 §6](f-05-results.md), [SDS](../../system-sds.md) and [Tracker §3](tracker.md).

## Phase A: schema decisions and responsibility

The contracts agree on the S1 model. Use one additive Prisma migration history, with User/session, academic context, and survey/response increments. No parallel User table, summary table, anonymous workflow or additional product entity is needed.

| Storage invariant | Database enforcement / service boundary |
| --- | --- |
| User and session | Unique normalized email, role enum, bounded display name; session table exactly public.auth_session(sid varchar, sess json, expire timestamp(6)), expiry index. UTC pool options. Session JSON is represented in Prisma so subsequent migration comparisons retain the table; runtime session access remains connect-pg-simple's responsibility. |
| Academic context | Course code unique; Section(courseId,term,sectionCode), Membership(sectionId,studentId), Lecture(sectionId,sequence) unique. Native calendar date, positive sequence. Section owner role and Membership respondent role are checked in fixtures/services, not a cross-table CHECK. |
| Survey | Unique lectureId, owner FK, positive definitionRevision and coherent state/timestamps. Canonical ownership is Survey→Lecture→Section; redundant owner consistency is verified in fixtures and must be checked by the future service under its transaction. |
| Question | Stable UUID, unique survey/position and survey/id pairs. Positive position WITHOUT a maximum: F-03 stages positions 11–20 while reordering. Final contiguous 1–10, nonblank published definitions and at least one RATING are future publication-service checks. Draft blank prompts/labels/interpretation remain valid. |
| Frozen eligibility | Unique survey/student, FKs to Survey/User, no FK to live Membership. Deleting Membership cannot revoke published eligibility. Publication freezes it with state under the Survey lock in #19. |
| Participation / identified bundle | Participation PK and FK to eligibility; identified bundle unique survey/student and survey/id. No Participation→bundle pointer or per-response timestamp. identifiedStudentId remains nullable as required by F-04's storage contract; the S1 service MUST require a nonnull trusted actor before insertion. This is not an enabled anonymous mode. |
| Answer | Unique bundle/question; composite same-survey FKs to Question and ResponseBundle; exactly one rating/text column; integer rating 1–5 and text ≤2,000 PostgreSQL characters (code points). Type-to-question, required completeness and nonempty response are transaction-service checks. |
| Delete/freeze/transactions | Draft Question deletion cascades only with Survey; submitted Answer FKs restrict deletion. Other domain FKs restrict deletion. No automatic cascade through submissions. No SQL CHECK claims to freeze rows after publication or implement ownership/type cross-table queries. #19/#20 retain Survey FOR UPDATE locking, lifecycle/immutability, atomic writes and duplicate/close ordering. |

UUID defaults use PostgreSQL gen_random_uuid(). No later-sprint source/metric/option/note fields are introduced. The first migration is independently reviewable for #17; full #16 completion still requires all applicable migrations, fixtures and verification. No contract conflict requiring a competing design was found; future services must preserve the explicit boundaries above.

## Phases B–D and safe operation

The implementation uses `prisma/schema.prisma` and three ordered migrations: `202611080001_user_session`, `202611080002_academic_context`, `202611080003_survey_response`. `apps/api/src/database.ts` explicitly constructs the Prisma 7 PostgreSQL adapter/client with UTC and a bounded connect wait; it opens no application connection on import. The API still exposes only its existing liveness route. Build/typecheck generate the real client first; generated TS is compiled with the API and is ignored in source control.

Generated code, local secrets and disposable cluster data stay ignored. Never run Prisma migrate reset or seed a development/deployed database. The accepted assertTestDatabase guard remains unchanged; test migration/seed commands require it before connecting. Forward development migration is a separate explicit command/opt-in and does not run seed.

## Commands and environment

Use the accepted Node 24.22.1 / npm 10.9.2 / PostgreSQL 17 profile and existing lockfile. From the root after `npm ci`:

```sh
npm run db:validate
npm run db:generate
npm run typecheck
npm run build
npm run test:unit
npm run test:api
```

Schema validation/generation do not connect; the Prisma config's unused URL fallback exists solely for these commands. Generated files go under ignored `apps/api/src/generated/prisma`. Do not import this server client from web code. `prisma.config.ts` also records the guarded seed entrypoint; direct `prisma db seed` still calls that same safe wrapper.

For ordinary disposable test setup, configure the ignored `.env.test.local` from the example with actual distinct development/test targets, `ALLOW_TEST_DATABASE` equal to the allowlisted test database name, and `NODE_ENV=test`:

```sh
npm run db:migrate:test
npm run db:seed:test
```

Seed additionally requires `SEED_SYNTHETIC_DATA` to equal the test database name and privately supplied `SEED_OWNER_PASSWORD` / `SEED_RESPONDENT_PASSWORD` (12–128 code points). No default password is committed or printed. The explicit seed creates three Owners (one with no Sections), four Respondents (one unenrolled), two Courses, three Sections (one empty), three Lectures including equal dates/different sequence, three Memberships, one identified Draft and two ordered questions. Stable IDs/natural keys are in `prisma/fixtures.ts`. Owners 1/2 have Sections of the same Course; Respondent 13 belongs only to Owner 2's Section. No Published eligibility, participation, response or session is fabricated by seed.

Seed is a single advisory-locked transaction. It inserts absent fixtures, verifies existing values/passwords and retains existing hashes; it never updates/deletes fixtures, sessions or submissions. An edited fixture, natural-key collision or different supplied password causes rollback/refusal, not a reset. A later service-edited/published seed Draft is therefore a reason for safe refusal. SQL integration fixtures separately create their own publication/submission storage; this is not implemented F-03/F-04 behavior.

For development **forward migrations only**, use the ignored `.env` with `NODE_ENV=development` and separately set `ALLOW_DATABASE_MIGRATIONS` to the intended database name, then run `npm run db:migrate:dev`. The wrapper rejects host/port query overrides and verifies the connected database before `prisma migrate deploy`. It does not reset or seed. Inspect a failed migration and resolve it through reviewed Prisma recovery procedures; no automatic destructive repair is provided. Deployment/production operations are outside this issue.

## Disposable foundation verification

The foundation suite requires a **new empty dedicated PostgreSQL 17 database**. Set the existing test URL/name opt-in and an additional `ALLOW_FOUNDATION_TESTS` matching that name, then run:

```sh
npm run test:db:foundation
```

Do not pre-migrate/pre-seed that database: the suite verifies it is empty, deploys the real migration history itself, verifies no-op redeployment, then seeds/compares fixtures. For another full run create another empty disposable database; there is no reset command. Never repoint it at an existing development database or container. Test-generated passwords stay in memory. Existing `npm run test:db` and `npm run check:orm` can then check tooling compatibility on the same dedicated test target.

The nine foundation cases cover fresh/idempotent Prisma deployment, repeat seed, conflict refusal, SQL constraints/reorder/rollback, typed client readback, session-table schema drift, connect-pg-simple storage compatibility, truly overlapping uniqueness (observe the loser waiting on a lock), and repeat seed preserving submitted associations. They are persistence checks, not F-01–F-05 AC/STS passes. `tests/database/constraints.sql` is reused by the suite; its local temp helpers and storage assertions roll back. It must never be run against an unguarded target. PostgreSQL may use 23503 or 23001 for the tested restrictive FK deletions; successful deletion or any other error still fails the assertion.

Actual commands/results, environment failures and remaining limitations are recorded in [database verification](database-verification.md). No human review or full Issue #16 completion is inferred from the existence of schema/tests.
