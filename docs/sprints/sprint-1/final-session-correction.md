# Final MVP session correction

Recorded 2026-11-12 (Asia/Bangkok). Refs #25 and release PR #40. Base staging: `1543c6e6044f292613f60a9f4d9e361aa46dacec`. This is a bounded production correction for the three findings in the owner's requested deep release review; no product scope, contract, schema or dependency change.

| Finding | Production correction | Permanent regression |
| --- | --- | --- |
| R40-DEEP-01: stale bootstrap after logout / reconnect cancelling pending revocation | Tag each shared bootstrap with the generation that issued its request. Drain old flights before a fresh check so stale responses cannot overwrite cookies after that new check. Coalesce only the current generation. A synchronous logout guard prevents revalidation from reopening private UI until confirmed revocation; pending failures retain deliberate retry. Clear obsolete loading state on logout so a held old check cannot hide that retry. Preserve one StrictMode bootstrap and same-identity unsaved edits. | `tests/browser/session-lifecycle.spec.ts`: late pre-logout response after 204; failed revocation plus reconnect/visibility; failed revocation while the old check remains held. Three actual Chromium/HTTP-fixture scenarios at 1280/360, six executions. These are frontend race proofs, not backend authorization-bypass tests. |
| R40-DEEP-02: two clock reads create an invalid lifetime | Capture one creation timestamp and derive both guest/auth start and expiry from it. Preserve strict lifetime validation. | `DEEP40-02` in the real PostgreSQL feature suite: advancing clock for guest bootstrap and login, exact persisted 30-minute/eight-hour duration, usable subsequent authenticated read. |
| R40-DEEP-03: inherited store lookup rounds time upwards | Override store lookup using the same clock and millisecond precision as session creation/validation. A row at the exact deadline can be loaded for the middleware to report expiry; it cannot authenticate at/after that instant. Preserve atomic save and failure cleanup. | `DEEP40-03`: actual store read with explicit cookie replay at a fractional deadline minus one millisecond, exact deadline and deadline plus one. First returns 200; latter two 401. HTTP Expires remains a second-precision transport representation and does not extend server validity. |

## Observed history and exact sources

The deep review ran against unchanged `1543c6e`: two browser privacy assertions failed; separate real-PostgreSQL probes demonstrated invalid guest/auth durations and premature expiry, confirmed on another fresh database. Those scripts/logs were ignored local review artifacts, not fabricated RED commits. Permanent regressions were subsequently added with the correction.

`54b76aa` contains the initial production correction and permanent tests. Its full pre-main matrix passed 206 tests plus typecheck/build/ORM/built-process restart. An additional targeted check then exposed a held old bootstrap leaving the logout retry hidden behind obsolete loading state. That check failed before the one-line loading-state correction. `146e013` includes that correction and its permanent scenario. The final full matrix is bound to the full tested commit in [verification](final-session-verification.json); repeats are not additional distinct tests.

The final matrix includes unit, liveness, real API/PostgreSQL, release fault/deadlock/COMMIT-loss, foundation, database tooling, isolated HTTP/browser, real browser/API/PostgreSQL and smoke checks. It includes the previous expiry/CSRF/store failure/access/rollback/concurrency/focus/reflow/native-zoom coverage. Each database preparation used a new explicitly allowlisted empty target; no resets or reuse of user demo storage. Credentials and synthetic session identifiers stay outside public evidence.

## Integration and release handoff

The final code/test commit and hashes are retained separately from the documentation evidence commit. Review/integrate this correction into staging and verify the resulting source against the manifest; no previous approval is relabelled as approval of this correction.

PR #40 remains the existing staging-to-main release PR. It must consume the actual integrated fix and substantive opposite-member release approval. The owner's request authorizes progressing toward main; actual required teammate approval is not invented. After approved main integration, run the required checks on the actual main SHA using fresh databases, then record the immutable assessed tag/reference under #25. The final PDF/contribution work remains #26. No main merge/tag/post-main result is claimed by this pre-main record.

The bounded MVP scope is unchanged. Earlier G-04 dispositions remain proposals for actual reviewer acceptance; this correction does not claim complete WCAG/assistive-technology testing, later deployment/P15, or every possible STS permutation. It adds no new MVP acceptance requirement.
