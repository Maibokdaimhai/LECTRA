# PR46-DEF-01: preserved failure and verified correction

This is historical evidence of the same defect now corrected in the assessed sprint-1.1 release. It is not a current failing test or an unresolved release blocker. The original investigation files, raw JSON and original test source remain unchanged in the repository/history.

## Original real RED

At test-first commit eef5e75, five real API/PostgreSQL executions gave 3 PASS / 2 FAIL. PR46-I04-PUBLISHED and PR46-I04-CLOSED expected 409 MODE_NOT_SUPPORTED/error-only/no answer sentinel but actually received 200/data/answer sentinel. Both represent one missing mode guard; original rows remained unchanged. The original production enum was IDENTIFIED-only; a new disposable database alone was extended to exercise the unexpected unsupported state.

```text
Test Files  1 failed (1)
Tests       2 failed | 3 passed (5)
Expected: 409
Received: 200
```

The first three passing cases checked unsupported-mode POST before duplicate, Draft results state-before-mode, and unsupported-mode owner results in Published/Closed. Their historical PASS does not hide the two own-readback FAIL observations. Full original source/result hashes and actual failure output are retained in post-release-ac-verification.json, post-release-ac-test-results.json and mode-readback-correction-evidence/red.txt.

## Production correction and candidate GREEN

Commit 609bbcd36d3d3a5baeb9829ed9d36876ec5fe17e added the guard immediately after trusted scope authorization and before participation/bundle/answer queries. The enhanced regression preserves all original expectations and additionally checks eligible unsubmitted409, ineligible404 and owner403. Actual selected candidate verification passed 5 focused cases, 41 feature and 7 release cases:53 selected passes, plus build/typecheck/restart. These candidate results remain separate from both historical and current full matrices. PR #47 received actual human review/approval; R47-01 canonical test synchronization was completed through PR #46 before integration.

```typescript
const row = await scope(db, req);
if (row.mode !== 'IDENTIFIED')
    fail(409, 'MODE_NOT_SUPPORTED');
```

## Current exact-main GREEN

The reviewed correction is in assessed main b458cb65736029f5c7de55e49c9afd6bc8de702a / sprint-1.1. A new clone and new databases ran the full selected matrix:219 PASS / 0 FAIL / 0 SKIP, including all 5 focused PostgreSQL cases. The mode boundary now rejects both lifecycle states without returning identified fallback answers and preserves authorization precedence. No production enum/migration or Anonymous Mode was introduced.

```text
vitest.post-release.config.ts
Test Files  1 passed (1)
Tests       5 passed (5)
```

Original sprint-1/af2e103214 PASS and originaladditional3PASS/2FAIL remain recorded as they actually occurred. They are neither overwritten nor summed into the current 219.
