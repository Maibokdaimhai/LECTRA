# PR #40 — Sprint 1 UI focus and validation correction

Recorded 2026-11-12 (Asia/Bangkok) for Issue #25 on `fix/25-ui-accessibility-recovery`. Tested working tree is based on `2961014e6b21668f20321e0acade382e67972f1a`; the correction is uncommitted. [Verification record](pr40-ui-accessibility-verification.json) identifies the actual source/configuration hashes, executed cases and screenshots. No Git or GitHub operation was performed.

## Findings and bounded correction

| Finding | Root cause / before | Correction / observed after |
| --- | --- | --- |
| UI-F01 | Reordering could disable the focused Move Up button; removal unmounted it. There was no explicit focus destination. Unsaved questions also used index-based React keys. | Give questions stable local editor keys and input IDs. After the DOM update, focus the moved question's prompt. Removal focuses the next question, otherwise the previous question, otherwise Add question. Keyboard tests cover moving middle/last questions, the disabled first Move Up control, removing first/middle/last and removing the only question. Saved ordering and retained server IDs are checked through the real API. |
| UI-F02 | The shared error summary contained only a general error. Draft/answer inputs had no linked field errors or stable navigation targets. | Derive safe messages from known field rules, link the summary to stable input IDs, and supply `aria-invalid` and `aria-describedby`. Enter on a summary link focuses its input. Rejected Draft/response values remain intact. Draft title/prompt/scale limits, publication completeness, required ratings, required TEXT and TEXT limits have focused coverage. Unknown server messages are not echoed by these forms. Existing server validation remains authoritative for saves/submissions. |
| UI-F03 | Confirmed submission removed the focused Submit control without assigning focus to the replacement content. | Make the unchanged “Submission received” heading programmatically focusable. Focus it after a confirmed POST success or a successful persisted-status reconciliation establishing submission. Initial readback does not request focus; rejection or an unresolved outcome cannot focus a success heading. No automatic POST retry was added. |

Only frontend presentation, field validation/focus helpers, focused tests/configuration and this new evidence package change. API routes/contracts, database schema/migrations, dependencies, F-01–F-05 specifications, existing tests/fixtures and all historical evidence remain unchanged.

## Actual verification

Node `24.22.1`, npm `10.9.2`, PostgreSQL `17.11`, Playwright `1.65.0`, Chromium `158.0.8127.18`; Windows x64. Commands use the project's pinned local runtime on PATH.

| Command / check | Actual final result | Boundary |
| --- | --- | --- |
| `npm run typecheck` | Pass | API, web and tooling TypeScript. |
| `npm run build` | Pass | API and web production build. Initial sandbox subprocess denial is recorded separately below. |
| `npm run test:unit` | 41 passed; 0 failed/skipped | 37 existing unit tests plus 4 frontend validation tests; no database. |
| `npm run test:e2e:recovery -- --reporter=list,json --output .local/evidence/ui-accessibility-recovery-verified` | 74 passed; 0 failed/skipped; retries 0 | 38 preserved mocked recovery executions plus 36 new mocked-HTTP browser executions (9 scenarios × 4 configurations). These are not PostgreSQL tests. |
| `node scripts/playwright.mjs test --config playwright.features.config.ts --reporter=list,json --output .local/evidence/ui-accessibility-real-verified` | 22 passed; 0 failed/skipped; retries 0 | 14 preserved real browser/API/PostgreSQL executions plus 8 new executions (2 scenarios × 4 configurations). The isolated harness supplied process environment directly, bypassing the npm alias's private `.local/browser.env` loading. |
| `npm run test:e2e -- --reporter=list,json --output .local/evidence/ui-accessibility-smoke` | 4 passed; 0 failed/skipped | Preserved database-free workspace smoke checks. |

Selected total: **141 passing test executions**. Repeated development runs are not additional distinct tests. These checks do not constitute complete STS/AC coverage or release acceptance.

The new real tests use actual application routes and PostgreSQL. They check genuine 422 rejection, zero response rows after rejection, retained text, error-link focus, real 201 success, focused confirmation, persisted own-answer readback, one Participation/ResponseBundle with two Answers, Published count-only UI and Closed `2.00` results. Existing journeys continue to check expiry/logout, uncertain committed responses, duplicate/Closed rejection and results persistence. No API success or database behavior is mocked in the real suite.

## Keyboard, reflow and zoom evidence

The new mocked and real scenarios run at 1280px desktop, 360px, 320px and genuine 200% browser zoom. The zoom fixture loads an isolated temporary extension/profile, uses Chromium `chrome.tabs.setZoom(2)` with per-origin persistence, verifies `getZoom() === 2`, then asserts `innerWidth=640`, `outerWidth=1280`, `devicePixelRatio=2` during the actual application journey. This is native browser zoom; neither a resized viewport alone nor CSS scaling is used as proof.

Tab navigation, Enter/Space activation and rating arrow keys drive the affected controls. The helper checks `:focus-visible` and a visible outline at keyboard destinations. Tests assert focus after reorder/removal, error-link activation and confirmed submission, and assert no page overflow in the affected views. Mixed Thai/English text and literal script markup are retained safely. Authoring setup uses the preserved survey fixture helper; this does not claim every setup action was keyboard driven.

| Configuration | New isolated HTTP/browser cases | New real API/PostgreSQL browser cases | Result |
| --- | --- | --- | --- |
| Desktop 1280 × 720, normal zoom | 9 | 2 | Pass |
| Narrow 360 × 800, normal zoom | 9 | 2 | Pass |
| Reflow 320 × 900, normal zoom | 9 | 2 | Pass |
| Desktop 1280 × 900, native 200% zoom (640 CSS px) | 9 | 2 | Pass |

Screenshots are actual viewport captures from the final real run using CDP, which preserves the native-zoom capture correctly. They show the current scroll position, not a complete page. The agent inspected the 320px Draft error, 200% focused confirmation, 200% corrected rating and 320px Closed navigation captures. This is automated execution plus agent image inspection, not human or assistive-technology acceptance.

| Capture | 320px | Genuine 200% zoom |
| --- | --- | --- |
| Rejected title, retained value and focus after error-link activation | [Draft](ui-accessibility-evidence/draft-field-error-chromium-320.png) | [Draft](ui-accessibility-evidence/draft-field-error-chromium-zoom200.png) |
| Response after following the validation link and correcting the rating; retained mixed-language text | [Response](ui-accessibility-evidence/response-validation-chromium-320.png) | [Response](ui-accessibility-evidence/response-validation-chromium-zoom200.png) |
| Confirmed submission heading with focus outline | [Confirmation](ui-accessibility-evidence/submission-focus-chromium-320.png) | [Confirmation](ui-accessibility-evidence/submission-focus-chromium-zoom200.png) |
| Closed view with keyboard focus returned to navigation; result values are verified by assertions, not visible in this top-of-view capture | [Closed navigation](ui-accessibility-evidence/closed-results-chromium-320.png) | [Closed navigation](ui-accessibility-evidence/closed-results-chromium-zoom200.png) |

## Requirement mapping and limitations

| Correction | Existing requirement / planned STS | Evidence boundary |
| --- | --- | --- |
| UI-F01 | AC-F03-05, AC-F03-24; TEST-F03-E01/E05 | Focus recovery and persisted reorder are demonstrated; this does not establish every E01/E05 precondition or manual M01 condition. |
| UI-F02 | AC-F03-06/23/24; TEST-F03-E02/E05; AC-F04-02/03/17/25; TEST-F04-E02 | Selected known fields/boundaries, safe rendering and retained values are demonstrated; arbitrary forged payload validation remains backend scope. |
| UI-F03 | AC-F04-09/17/18/25; TEST-F04-E01/E02/E03 | Real rejection/commit/readback and focus are demonstrated; mocked unresolved-outcome rejection plus preserved real recovery tests supplement this. |
| Preserved results | AC-F05-20; TEST-F05-E04/M01 | Selected Closed results/navigation/reflow are exercised; full manual M01, every chart fixture and full accessibility certification are not claimed. |

[System SDS UI/accessibility guidance](../../system-sds.md) and [Product DoD](product-dod.md) remain unchanged. Historical AC/STS inventories and dispositions are not relabelled Pass by this correction. Opposite-member review and G-04 human acceptance remain pending; this package does not authorize PR #40 main integration.

## Development history and isolation

Before application edits, focused regressions failed for missing reorder focus, missing field links and missing success-heading focus. The first success test had a keyboard setup mistake (trying to Tab directly to an unchecked noninitial radio); a corrected Space/arrow setup separately reproduced the actual heading-focus failure. These were working-tree RED checks, not invented TDD commits.

Intermediate runs remain separate from final evidence: the first zoom harness reset zoom on navigation (63 pass/7 fail), and a later textarea locator mismatch failed new written-answer checks (70 pass/4 fail mocked; 18 pass/4 fail real). Accessible textbox-role locators fixed the harness without relaxing value/focus assertions. A subsequent real run was interrupted by a source-edit hot reload, giving 21 pass/1 fail in an existing login test; the final frozen-source rerun passed all 22. An attempted data-URL harness import failed module resolution before database creation. The first build was blocked by sandbox `spawn EPERM`; the authorized normal-subprocess build passed. None of these attempts is counted as extra passing tests or silently recast as green.

Each real run used a newly initialized loopback PostgreSQL cluster, a random new empty database and explicit `ALLOW_TEST_DATABASE`/`ALLOW_BROWSER_TESTS`. The harness checked its server data directory before creating the database; the existing global setup refused populated storage and applied migrations/seed only to the new target. Synthetic passwords/session secret stayed in process environment. Final run database: `lectra_test_ui_a02d2179c4a2`. Its cluster and temporary services were stopped after the run. Existing development/demo databases, containers and private environment files were not used.

## Exact changed files

- `apps/web/src/main.tsx`
- `apps/web/src/theme.css`
- `apps/web/src/ui-validation.ts` (new)
- `apps/web/tests/ui-validation.test.ts` (new)
- `tests/browser/support/ui-keyboard.ts` (new)
- `tests/browser/ui-accessibility.spec.ts` (new)
- `tests/browser/ui-accessibility-real.spec.ts` (new)
- `playwright.features.config.ts`
- `playwright.recovery.config.ts`
- `vitest.unit.config.ts`
- This report and `pr40-ui-accessibility-verification.json` (new)
- Eight new screenshots linked above under `ui-accessibility-evidence/`.

Raw intermediate/final runner output remains in ignored `.local/evidence/ui-accessibility-*` files. Generated build/Prisma/browser artifacts remain ignored. Existing repository files were checked against a start-of-task SHA-256 snapshot; only the five existing files named above changed. Ready for independent teammate review of this bounded correction, subject to that actual review.
