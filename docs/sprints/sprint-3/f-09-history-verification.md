# F-09 survey history verification

The original RED/GREEN runs below took place on 27 November 2026 ICT. The implementation branch used for review and integration was `feat/f09-survey-history`. Songwit approved [PR #83](https://github.com/Maibokdaimhai/LECTRA/pull/83) at `3d5653a` after [CI & Docker Build](https://github.com/Maibokdaimhai/LECTRA/actions/runs/46153055660) passed. It merged into staging as `fee75ee`; the reviewed Deliverable 2 candidate then merged to main via [PR #84](https://github.com/Maibokdaimhai/LECTRA/pull/84) as `f08ed43`.

| Checkpoint | Version and evidence |
| --- | --- |
| Release baseline | `main` 11a3d693585f5d601e974fcacb0e63f7c65dff1a and staging efafce7e406abcc6cade2d173d0a5206459edf97 share tree 38172e1de0c730c2fd5e10f81d6ec053c4ccf203. The pre-change Production revision was lectra-00010-9qf. |
| Contract | 6aba863, 19:27. AC-F09-01 and AC-F09-02 describe the owned history slice. |
| RED | fc0564e, 19:28. `node node_modules/vitest/vitest.mjs run --config vitest.features.config.ts -t TEST-F09` against a fresh PostgreSQL 17 database. Two failed, 43 filtered out. One-day combined filter was expected to succeed with 200 but received 422. Foreign Section was expected to get the scoped 404 but received 422 from the unsupported parameter check. |
| GREEN | Implementation 5084075. Full `node node_modules/vitest/vitest.mjs run --config vitest.features.config.ts` on a new database at 19:34. 45 passed, 0 failed or skipped. TEST-F09-I01 verified inclusive dates, scoped result ordering and pagination. TEST-F09-I02 verified guest/role behavior, other-owner scope and invalid query input. |
| Build and unit/HTTP | Typecheck and production build passed. Unit 70 passed, liveness/static API 13 passed. |
| Browser fixture | First selected browser run timed out in two configurations because the locator used an exact label matcher on a nested select. a14ee5f changed only that locator to the accessible combobox. Selected rerun passed at 1280 and 360 CSS pixels. |
| Real browser regression | `node scripts/playwright.mjs test --config playwright.features.config.ts` on a14ee5f and a fresh PostgreSQL 17 database with synthetic accounts. 24 passed, 0 failed or skipped. TEST-F09-E01 submitted the filter UI, inspected the real API response and persisted survey ID, checked empty/clear behavior and saved a screenshot at both widths. Existing owner/student Closed-results and forbidden-access cases also passed. |

No new persistence or change to result visibility for history filtering. AC-F09-03 and AC-F09-04 for metric compatibility and trends depend on the Sprint 2 provenance and privacy projection. AC-F09-05 controlled load and dedicated final accessibility evidence remain planned. No new release is claimed from these local results.
