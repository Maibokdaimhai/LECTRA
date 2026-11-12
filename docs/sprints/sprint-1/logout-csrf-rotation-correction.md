# Logout CSRF rotation correction

Recorded 2026-11-12 (Asia/Bangkok). Bounded follow-up to PR #45, based on `f5dd170eb85832586eaa530dff96be3f7fe94597`. The checked working branch is `fix/25-final-session-boundaries`, rather than the requested `review/pr-45`; no branch change or other Git/GitHub operation was performed. Results below describe the **uncommitted correction**, identified by [verification hashes](logout-csrf-rotation-verification.json), not tests of an accepted staging/main commit.

## Root cause and correction

An expired authenticated session can be replaced by a guest session during a background bootstrap. Chromium processes its real `Set-Cookie` headers before the delayed JSON body supplies the new CSRF token. Logout correctly hides private content and ignores the stale bootstrap identity, but previously retained the old authenticated CSRF token forever. After a storage outage produced 503, deliberate retries sent that obsolete token with the new guest cookie and received `403 CSRF_INVALID`.

The first logout attempt remains immediate. Each deliberate **Retry sign-out** drains the outstanding bootstrap, ignoring its identity/token, then performs a fresh same-origin, uncached session GET. Only the fresh token is retained for one logout POST. Reconciliation never installs a user or reopens the workspace. Failed reconciliation sends no POST; any failure retains Pending Logout, safe feedback and deliberate retry. Only a confirmed 204 clears Pending Logout and permits the normal guest bootstrap. There is no automatic logout retry and no backend CSRF change. Existing generation, StrictMode bootstrap sharing and visibility guards remain in place.

## Permanent regressions and RED/GREEN

| Check | Composition and assertions | Final result |
| --- | --- | --- |
| `PR45-CSRF` in [logout-csrf-rotation.spec.ts](../../../tests/browser/logout-csrf-rotation.spec.ts) | Actual Chromium, production frontend, Express auth routes and disposable PostgreSQL. Advance the server clock beyond eight hours; hold a real guest bootstrap after native cookie headers and the first JSON byte; verify the browser cookie changed while the body remains incomplete. Rename only the isolated database's session table to produce real 503; restore it; finish the obsolete body; deliberately retry. Require a fresh session GET, current token, actual 204, no automatic POST, no reload, no workspace restoration, deletion of the guest SID row and subsequent `/api/auth/me` 401. A DOM observer also checks privacy during recovery. | 1280×720 and 360×800: **2 passed**. |
| Existing three logout lifecycle scenarios in [session-lifecycle.spec.ts](../../../tests/browser/session-lifecycle.spec.ts) | Preserve stale response after 204, failed logout with reconnect/visibility, and retry availability while an old bootstrap remains held. | Both sizes: **6 passed**. |
| Two added lifecycle scenarios in the same file | Retry waits for a held old flight and a fresh GET; even an authenticated fresh projection cannot reopen private content while POST is held. A failed reconciliation GET sends no additional logout POST or internal error text; another explicit action is required. | Both sizes: **4 passed**. |
| Existing `R1:` session-revalidation cases in [review-recovery.spec.ts](../../../tests/browser/review-recovery.spec.ts) | Same-identity owner edits retained, account change clears them, service failure gates mutations, respondent selection retained. HTTP fixtures, not PostgreSQL proofs. | Both sizes: **6 passed**. |
| Selected existing F-01/API regressions | Real PostgreSQL: guest/auth creation clocks, exact expiry, regeneration, CSRF, revocation, concurrent reads/logout, persistence failures and safe origin/cookie behavior. | **18 passed; 23 unrelated cases excluded by the name filter**. |

The permanent real regression failed at **both sizes** against the pre-fix production bundle: expected 204, received actual 403. That bundle was built before the frontend edit; its hash and original source hash are retained in the verification record. The same test then passed against the rebuilt correction. The final real regression itself was unchanged between these RED/GREEN runs. The regression uses native HTTP streaming through the preview proxy, not `route.fetch`, cookie injection or mocked auth responses. Failure injection and response barriers exist only in test composition.

Harness development first exposed proxy buffering, an ignored response-end callback, startup-read/cookie-clear interference and an unreliable `networkidle` wait. Those failed attempts are not counted as product RED proof or passing coverage. The final fixture uses the response `finish` event, a first streamed byte, server-observed completion of startup requests and a production preview without HMR. Earlier successful repeats are not additional distinct tests.

## Execution and safety

Actual runtime: Node **24.22.1**, npm **10.9.2**, Playwright **1.65.0**, Chromium **158.0.8127.18**, PostgreSQL **17.11** on Windows. `npm run typecheck` and `npm run build` passed. The final selected browser run passed **16** HTTP-fixture checks; the separate real-browser run passed **2** checks; the API run passed **18**, with **23** non-selected cases reported skipped. No final selected failure remains. The historical 208-test matrix was not rerun or relabelled.

Commands executed, using the pinned runtime on `PATH`:

```text
npm run typecheck
npm run build
node scripts/playwright.mjs test --config playwright.logout.config.ts --grep PR45-CSRF --reporter=list,json
node scripts/playwright.mjs test --config playwright.recovery.config.ts session-lifecycle.spec.ts review-recovery.spec.ts --grep "logout|R1:" --reporter=list,json
node node_modules/vitest/vitest.mjs run --config vitest.features.config.ts --testNamePattern "DEEP40-02|DEEP40-03|TEST-F01|R40-01|^F-01:|^F01-store:"
```

The browser command requires a preceding build and a **new, empty, disposable** PostgreSQL database. Supply `NODE_ENV=test`, `APP_ORIGIN=http://127.0.0.1:4174`, matching `DATABASE_URL`/`TEST_DATABASE_URL`, a distinct unused `DEVELOPMENT_DATABASE_URL`, and `ALLOW_TEST_DATABASE`/`ALLOW_BROWSER_TESTS` matching the exact test database name; provide fresh generated `SESSION_SECRET`, `SEED_OWNER_PASSWORD` and `SEED_RESPONDENT_PASSWORD`. Its inherited [global setup](../../../scripts/prepare-browser.ts) refuses populated targets, then migrates/seeds only the opted-in target. Ports 4174 and 3102 must be free; existing services are not reused.

Run the API suite with a **different new empty database**, exact `ALLOW_TEST_DATABASE`/`ALLOW_FEATURE_TESTS` opt-ins and a distinct development-reference `DATABASE_URL`; `TEST_DATABASE_URL` points to the disposable target. See the existing [setup safeguards](setup-and-handoff.md). The recorded executions used newly initialized loopback clusters, verified their physical data-directory paths and database nonexistence before creation, and stopped only those clusters afterward. Temporary table names were restored in fixture cleanup; the API run reported no other open transactions. No development/demo/shared database, existing container or private environment file was used.

## Coverage and handoff boundaries

This is supplementary bounded evidence for [AC-F01-13/16](f-01-authentication.md) and [TEST-F01-E05 / TEST-F01-I17](f-01-authentication-sts.md). It demonstrates recoverable failed logout and current guest-token enforcement; it does not newly certify every policy-matrix permutation or turn other Partial/Not run records into Passed.

The original [session correction](final-session-correction.md) and its [208-test verification](final-session-verification.json) retain their historical source and outcomes. Backend code, schema, migrations, dependencies, feature contracts and unrelated tests are unchanged. Broader browser/platform, deployment and release-acceptance limitations remain unchanged. The correction is ready for teammate re-review and the owner's commit workflow; no independent approval, PR review submission, staging integration or main release acceptance is claimed.
