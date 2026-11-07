# Issue #15 - Workspace Verification Record

Observed 2026-11-07 on branch `chore/15-sprint1-workspace`, based on staging `090a5288ac57085d7d7107744d976c31ffd8192d`. This is uncommitted working-tree verification, not a tested commit, accepted release, teammate review or completed product DoD. See [setup design](workspace-setup.md) and [actual commands](../../../README.md).

## Environment and source identity

- Node 24.22.1, npm 10.9.2; exact direct dependencies and transitive resolution in the root lockfile. System Node 22.17.1 was not used for these checks.
- PostgreSQL 17.11 using local `postgres:17-alpine`, digest `postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`.
- Disposable loopback container `lectra-tooling-postgres`, port 55432, tmpfs data, synthetic credentials; database `lectra_test`, distinct from configured development target `lectra_dev`. No domain migration/seed was applied. After checks, the public schema contained zero tables. The temporary container was removed after verification.
- Final source/config/lock manifest: 37 files; SHA-256 `07b9fce1e415c0865193c0f0d273d918e454f1cba95c70734c9076d5185e6b61`. Per-file hashes were unchanged during final execution. Markdown documentation is outside this tooling manifest.
- Local raw records: ignored `.local/evidence/source-manifest.json`, `final-checks.json`, and `*-final.txt`. These local files are not published evidence and do not replace rerunning checks on the eventual committed/integrated release. No coverage percentage is claimed.

## Observed checks

| Command | Observed outcome | Scope |
| --- | --- | --- |
| `npm ci` | Exit 0; 323 packages installed, 326 audited | Lockfile installation on the selected runtime; audit reported zero known vulnerabilities at execution, not an application security guarantee. |
| `npm run typecheck` | Exit 0 | API, web and tooling TypeScript. |
| `npm run build` | Exit 0 | Actual API and web production builds. |
| `npm run test:unit` | 22 passed, 3 files | Configuration/origin safety (11), test-DB guard (10), native Argon2 compatibility (1). |
| `npm run test:api` | 2 passed, 1 file | Actual liveness and safe absent endpoint response. |
| `npm run test:db` | 2 passed, 1 file | Real PostgreSQL/UTC/allowlist and temporary transaction/rollback probe. |
| `npm run check:orm` | Exit 0 | Prisma 7.10.1 generation plus real PostgreSQL adapter SELECT; no domain table/migration. |
| `npm run test:e2e` | 4 passed | Real web/proxy/API smoke at 360px and 1280px; no mocked product login. |

Final automated test total: **30 passed**. No final test failures or skips were reported. The ORM compatibility command is a separate check, not an additional test count. Browser screenshots are local `.local/evidence/workspace-chromium-wide.png` and `workspace-chromium-narrow.png`; they show only the setup page and actual service status.

Additional process observations: the built server rejected invalid production HTTP configuration before listening (exit 1); valid local configuration served liveness and stopped cleanly on SIGTERM (exit 0). The setup helper created all three local configuration files with mode 0600 in an isolated temporary directory; a second invocation refused overwrite (exit 1), with file hashes unchanged. Temporary helper-test files were removed. Real generated secrets remain only in ignored local configuration, never example files.

## Failures and RED/GREEN limits

The first API smoke invocation in the restricted sandbox failed two cases with socket `listen EPERM`. The unchanged tests passed when local socket execution was allowed; that environment failure is not intended-behavior TDD evidence. Playwright browser installation initially hit a 30-second download timeout, then its automatic retry succeeded. Final browser tests ran without configured retries.

For the test-database safety rule, an actual initial stub accepted unsafe targets: **9 failed, 1 passed**. After implementing allowlisted-name, explicit opt-in and distinct-target checks, **10 passed** with the same assertions. Local records are `test-database-red.txt`, `test-database-green.txt`, and captured source/test files in `.local/evidence/`.

- RED source SHA-256: `a5006130360c859e0016caec3e612a61802553e212d733c62ea4dde676d58f89`.
- GREEN source SHA-256: `42d10765875e73b9dc2d41b60da1d338735ede6a97e0e52d55bb0b34cfd3c1dd`.

These are observed working-tree/source-hash records, **not Git commits or assessed-release TDD history**. They concern tooling safety, not F-01-F-05 business-rule coverage.

## Documentation checks

Local-link/table/fence checks passed across 29 Markdown files (186 local links, 160 tables); all 46 baseline requirement IDs and the existing F-01 20-AC/47-case/12-DoD mappings were retained. Markdown parser checks passed across 30 files including GitHub templates (161 tables). F-04 mapping passed in both directions for 25 AC and 36 planned cases. Diff hygiene, new-file whitespace, generated-secret exclusion, single root lockfile and final 37-file source-hash consistency checks passed.

The first English-only scan flagged an existing Thai UTF-8 feedback fixture in `f-05-results-sts.md`; that intentional fixture was retained and explicitly exempted from the language scan. It was not a broken contract or new non-English document prose. These structural checks do not replace substantive contract review.

## Remaining acceptance boundaries

F-01-F-05 domain acceptance tests remain **Not run**. The F-04 contract has 25 AC and 36 planned cases; no response implementation or passing result is implied. Issue #15 still needs actual teammate review/integration and clean-checkout reproduction. Issue #13 needs substantive review and recorded cross-feature agreements. Issue #16 must supply reviewed real schema/migrations/seed before dependent domain implementation. Product setup handoff (#24), integrated main release checks, actual teammate contributions and the Deliverable 1 PDF remain future work. Rerun relevant checks on the actual authorized commit and integrated release; never relabel this working-tree manifest as their SHA.
