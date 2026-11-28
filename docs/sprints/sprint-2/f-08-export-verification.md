# F-08 aggregate CSV verification

28 November 2026 ICT. Contract v0.2 from [PR #79](https://github.com/Maibokdaimhai/LECTRA/pull/79). This candidate depends on F-07 [PR #81](https://github.com/Maibokdaimhai/LECTRA/pull/81), which supplies choice and starter metadata.

| Evidence | Actual result |
| --- | --- |
| RED `2f41b7c` | TEST-F08-I01/I02 on disposable PostgreSQL 17 reproduced the missing route. A guest expected 401 and received 404. |
| API and PostgreSQL | 49 tests passed. Tested ownership, role, Closed-only and query guards, no-store attachment, exact v1 header, Thai, quotes, formula-like text, zero-data rows and the omission of written feedback. TEST-F08-I03 duplicates the checks for both quantitative question types against their stored aggregate bins and confirms each suppressed question has five blank cells. |
| Unit and build | 71 unit tests passed, including TEST-F08-U01 for formula prefixes, leading control characters, full-width prefixes, embedded quotes and a multiline Thai field. Typecheck and production build passed. |
| Real Chromium | Two TEST-F08-E01 runs passed at 1280 and 360 CSS pixels. Download started from the keyboard, saved the expected filename, preserved UTF-8 BOM and Thai text and reset the workspace on a simulated 401. A separate Python CSV reader decoded the downloaded file and confirmed 19 columns. |
| OPEN-09, TEST-F08-M01 | Proposed target is Microsoft Excel for Mac. The candidate uses UTF-8 BOM, CRLF, quoted text and leading apostrophe neutralization. An application access denial prevented the Excel import. Target reader and manual import behavior still require confirmation and recorded results. |

CSV and JSON use the same owner-scoped results snapshot and F-06 release projection. The CSV request skips reading written answers. This branch has no schema change.
