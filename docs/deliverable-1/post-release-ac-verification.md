# Additional post-release direct AC verification

Assessed application: **af2e1030984bcc816081b25b29c9de52a80efe30 / sprint-1**. Recorded 13 November 2026 (Asia/Bangkok). These new tests run the unchanged production implementation with new uncommitted test/configuration files on `review/pr-46`; they are not part of the historical 214-test run. All original 82 assessed source hashes still match.

## Actual result and exact scope

**3 PASS / 2 FAIL / 0 skipped**, five selected real API/PostgreSQL executions; exit code **1**. `npm run typecheck` passed. No full-matrix rerun or production correction was performed. The original **214 passed / 0 failed / 0 skipped** remains a separate historical result, not the outcome of this run.

Actual source: `apps/api/tests/post-release/ac-gaps.test.ts`. Dedicated configuration: `vitest.post-release.config.ts`; existing feature/release configurations and tests remain unchanged. The new execution IDs below supplement the accepted planned STS IDs; they do not rename or add retroactive preimplementation cases.

## Fixture and isolation boundary

The actual production migration defines SurveyMode with IDENTIFIED only. To exercise the contracts' defensive unsupported-mode fixture, this suite first verifies an empty explicitly allowlisted test database, deploys unchanged migrations/seeds, checks that original enum, then autocommits `ALTER TYPE "SurveyMode" ADD VALUE 'ANONYMOUS'` **only in that new disposable database**. Each survey is created/published and initially answered through actual application routes. Test-controlled SQL changes only its mode; every fixture is restored to IDENTIFIED in finally. No HTTP/SQL results are mocked, no application/schema/migration source is changed, and no anonymous product feature is enabled.

The task initialized a fresh loopback PostgreSQL 17.11 cluster, verified its physical data directory and database nonexistence before creation, and used exact ALLOW_TEST_DATABASE / ALLOW_POST_RELEASE_TESTS opt-ins. Existing development/demo/shared databases were not connected. Application pools closed; cleanup reported zero remaining temporary functions or other open transactions; only the task-owned cluster was stopped. The test-only enum extension is confined to that disposable database.

## Executed cases

### PR46-I01 - PASS

**AC / planned STS:** AC-F04-22 / TEST-F04-I10
**Actual test name:** PR46-I01 / AC-F04-22 / TEST-F04-I10: ANONYMOUS duplicate POST rejects mode before duplicate without writes
**Source:** apps/api/tests/post-release/ac-gaps.test.ts, assertion lines 78, 80, 83, 84, 85. The denial helper at line 67 asserts HTTP status, exact error envelope/code, no-store and absence of the synthetic comment.
**Expected:** ANONYMOUS Published duplicate and first submission both 409 MODE_NOT_SUPPORTED, before duplicate handling; original response rows unchanged.
**Actual:** Both 409 MODE_NOT_SUPPORTED, exact error-only envelope, no sentinel, unchanged participation/bundle/answer snapshot. IDENTIFIED duplicate control returned RESPONSE_ALREADY_SUBMITTED.

```typescript
expect((await mutate(student, path, body).expect(409)).body.error.code).toBe('RESPONSE_ALREADY_SUBMITTED');
expect(before.participation).toHaveLength(1); expect(before.bundles).toHaveLength(1); expect(before.answers).toHaveLength(2);
denial(await mutate(student, path, body), 'MODE_NOT_SUPPORTED');
denial(await mutate(other, path, body), 'MODE_NOT_SUPPORTED');
expect(await persisted(d.id)).toEqual(before);
```

### PR46-I02 - PASS

**AC / planned STS:** AC-F05-01 / TEST-F05-I02
**Actual test name:** PR46-I02 / AC-F05-01 / TEST-F05-I02: own Draft results reject state before mode without statistics or mutation
**Source:** apps/api/tests/post-release/ac-gaps.test.ts, assertion lines 93, 94, 97, 98, 99, 100. The denial helper at line 67 asserts HTTP status, exact error envelope/code, no-store and absence of the synthetic comment.
**Expected:** Own Draft results 409 RESULTS_NOT_AVAILABLE in either mode; no data or mutation. Foreign Owner 404; Respondent 403.
**Actual:** Exact expected 409/error-only response for IDENTIFIED and ANONYMOUS Draft; unchanged Draft, empty response rows, correct 404/403 controls.

```typescript
denial(await owner.agent.get(path), 'RESULTS_NOT_AVAILABLE');
expect((await pool.query('SELECT to_jsonb(s) AS row FROM "Survey" s WHERE id=$1', [d.id])).rows[0].row).toEqual(before);
denial(await owner.agent.get(path), 'RESULTS_NOT_AVAILABLE');
denial(await foreign.agent.get(path), 'NOT_FOUND', 404);
denial(await student.agent.get(path), 'FORBIDDEN_ROLE', 403);
expect(await persisted(d.id)).toEqual({ participation: [], bundles: [], answers: [] });
```

### PR46-I03 - PASS

**AC / planned STS:** AC-F05-21 / TEST-F05-I02
**Actual test name:** PR46-I03 / AC-F05-21 / TEST-F05-I02: own ANONYMOUS Published and Closed results reject without count or text fallback
**Source:** apps/api/tests/post-release/ac-gaps.test.ts, assertion lines 108, 113, 114, 118. The denial helper at line 67 asserts HTTP status, exact error envelope/code, no-store and absence of the synthetic comment.
**Expected:** Own ANONYMOUS Published/Closed results 409 MODE_NOT_SUPPORTED, no result payload and unchanged responses; normal identified results still work.
**Actual:** Both states returned exact 409 MODE_NOT_SUPPORTED with no count/text, unchanged rows. IDENTIFIED count-only and Closed comment controls returned 200.

```typescript
expect(Object.keys((await owner.agent.get(path).expect(200)).body.data).sort()).toEqual(['responseCount', 'survey']);
denial(await owner.agent.get(path), 'MODE_NOT_SUPPORTED');
expect(await persisted(d.id)).toEqual(before);
expect(normal.responseCount).toBe(1); expect(normal.questions[1].comments).toEqual([sentinel]);
```

### PR46-I04-PUBLISHED - FAIL

**AC / planned STS:** AC-F04-22 / TEST-F04-I10
**Actual test name:** PR46-I04-PUBLISHED / AC-F04-22 / TEST-F04-I10: ANONYMOUS own readback rejects without identified-answer fallback
**Source:** apps/api/tests/post-release/ac-gaps.test.ts, assertion lines 128, 129, 130, 131, 132. The denial helper at line 67 asserts HTTP status, exact error envelope/code, no-store and absence of the synthetic comment.
**Expected:** 409 MODE_NOT_SUPPORTED, top-level error only, no synthetic answer sentinel, unchanged persisted rows.
**Actual:** 200, no error.code, top-level data, synthetic answer sentinel present; persisted rows unchanged.

```typescript
expect.soft(response.status).toBe(409);
expect.soft(response.body.error?.code).toBe('MODE_NOT_SUPPORTED');
expect.soft(Object.keys(response.body)).toEqual(['error']);
expect.soft(JSON.stringify(response.body).includes(sentinel)).toBe(false);
expect(await persisted(d.id)).toEqual(before);
```

### PR46-I04-CLOSED - FAIL

**AC / planned STS:** AC-F04-22 / TEST-F04-I10
**Actual test name:** PR46-I04-CLOSED / AC-F04-22 / TEST-F04-I10: ANONYMOUS own readback rejects without identified-answer fallback
**Source:** apps/api/tests/post-release/ac-gaps.test.ts, assertion lines 128, 129, 130, 131, 132. The denial helper at line 67 asserts HTTP status, exact error envelope/code, no-store and absence of the synthetic comment.
**Expected:** 409 MODE_NOT_SUPPORTED, top-level error only, no synthetic answer sentinel, unchanged persisted rows.
**Actual:** 200, no error.code, top-level data, synthetic answer sentinel present; persisted rows unchanged.

```typescript
expect.soft(response.status).toBe(409);
expect.soft(response.body.error?.code).toBe('MODE_NOT_SUPPORTED');
expect.soft(Object.keys(response.body)).toEqual(['error']);
expect.soft(JSON.stringify(response.body).includes(sentinel)).toBe(false);
expect(await persisted(d.id)).toEqual(before);
```

## Known Limitation: PR46-DEF-01

`GET /api/surveys/:id/my-submission`, `apps/api/src/feedback.ts` lines 252-265, checks role/eligibility/state but does not check mode before querying participation/bundle/answers. Both Published and Closed ANONYMOUS fixtures returned 200 with the existing identified answer content, instead of the contract's 409 MODE_NOT_SUPPORTED and error-only payload. POST responses and Owner results already enforce the unsupported-mode guard.

This is a confirmed **conditional fail-closed contract defect**, not a claim that the current production schema permits anonymous collection or that cross-user access was obtained. It requires an unsupported mode in storage; the unchanged deployed enum rejects that mode. The fixture deliberately represents the unexpected/future/legacy state specified by the contracts. Both failing tests remain intact; no assertion was weakened, skipped or inverted.

AC-F04-22 therefore has a passing duplicate-submission branch and a **failing own-readback branch**. It must not be reported wholly Passed. AC-F05-01 has direct API evidence, but its UI unavailable-state check was not run here. AC-F05-21 has direct selected mode-rejection evidence; broader STS permutations remain Partial. The prior G-04 acceptance and release history are preserved as historical facts, not a new acceptance of this defect.

Team decision: PR46-DEF-01 is a Known Limitation discovered during additional post-release verification. PR46-I04-PUBLISHED and PR46-I04-CLOSED are two observations of the same underlying unsupported-mode own-readback defect. AC-F04-22 remains a Sprint 1 AC with Partial disposition. Correction is deferred for team follow-up in Sprint 2 before enabling F-06 Anonymous Mode; regression tests must be rerun after correction. The defect is not fixed. The existing Sprint Plan and original assessed release are unchanged.

## Commands and retained output

Runtime: Node 24.22.1 / npm 10.9.2 / Vitest 5.1.0 / PostgreSQL 17.11, Windows. Use a newly created empty database with the exact opt-ins; this suite must never run on an existing populated target.

```text
node node_modules/vitest/vitest.mjs run --config vitest.post-release.config.ts --reporter=default --reporter=json --outputFile=.local/evidence/pr46-direct-ac.json
npm run typecheck

Test Files  1 failed (1)
Tests       2 failed | 3 passed (5)
Skipped     0
Exit        1
Typecheck   exit 0
```

Failure output for each readback state includes expected 409 / received 200; expected MODE_NOT_SUPPORTED / received undefined; expected top-level error / received data; expected no answer sentinel / received present. These are product assertions after successful real setup, not migration/import failures.

[Machine-readable command, assertions, runtime, hashes and result](post-release-ac-verification.json). [Unmodified Vitest JSON output](post-release-ac-test-results.json). No credentials, CSRF tokens, cookies or raw session identifiers are included.
