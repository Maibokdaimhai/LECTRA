# R47-01 — canonical post-release regression ownership

PR #47 owns the enhanced `apps/api/tests/post-release/ac-gaps.test.ts` and `vitest.post-release.config.ts`. PR #46 synchronizes to the same test/configuration content; subsequent regression changes should be made through the correction/test work and synchronized rather than restoring the earlier investigation-only variant.

Canonical source: PR #47 head `12ddce3cb77c07245917e01364223322d220931b` (enhanced test introduced at `609bbcd36d3d3a5baeb9829ed9d36876ec5fe17e`). Git test blob: `811727feba018cc8168228b76e87ae8fb1c7826d`. Both PRs retain the additional eligible-unsubmitted MODE_NOT_SUPPORTED assertion, ineligible NOT_FOUND/404 and owner FORBIDDEN_ROLE/403 assertions in both lifecycle states, with persisted-row checks unchanged. Configuration was already identical.

## Historical evidence remains historical

The original PR #46 investigation source is preserved verbatim in `historical-evidence/pr46-ac-gaps-original.ts.txt`, from report commit `2310e1574ad8156a8c8e24b50d2b42d6389807ce`. Its normalized SHA-256 matches `post-release-ac-verification.json`. This text archive is outside executable test discovery; the only runnable regression source is the canonical enhanced file. The historical original 3-PASS/2-FAIL runner JSON, original RED evidence, and historical 214-PASS Sprint 1 verification are unchanged. They are not relabelled as results of the enhanced test.

The PDF remains an immutable report built from source `7e237c99c47ab99871d32f37c34fa862bc28a2f9` and continues to identify the original assessed tag. This integration-only source synchronization does not claim a rebuilt PDF or corrected main release. Its historical callback line ranges/hash refer to that recorded source; use the archived original or its Git revision when reproducing the original investigation. The enhanced test's passing correction run remains separately recorded in `../sprints/sprint-1/mode-readback-correction.json` (53 selected passes, not a new run here).

## Validation

The canonical test and config are byte-for-byte equal across PR branches; typecheck passes; the 113-AC renderer validation passes without changing the generated historical mappings. Git merge-tree is used to check integration without merging either branch or modifying main/staging. No production code, test assertions, historical results or release tag is changed by this synchronization. A focused database rerun is not claimed: this change copies the exact source already exercised by PR #47 and independently verified by the reviewer.
