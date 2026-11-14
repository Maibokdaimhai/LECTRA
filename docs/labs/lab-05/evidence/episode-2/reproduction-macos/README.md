# PR #52 reproducibility correction — supported macOS run

The reviewer reproduced a native Windows `npm`/`npm.cmd` resolution failure in the Python runner. Native Windows support is not required by the instructor. The correction explicitly documents macOS/Linux (including a WSL 2 Linux shell) as runner platforms, supplies complete WSL/Ubuntu commands and rejects native Windows before any subprocess/container creation. Application runtime code is unchanged.

## Actual execution

The author reran the complete runner on **14 November 2026** using:

```sh
python3 scripts/verify-lab5-episode2.py --create-local-test-databases --evidence-dir docs/labs/lab-05/evidence/episode-2/reproduction-macos
```

The pinned runtime and existing installed dependencies/Chromium were used in the implementation working tree; this was not a new dependency-install/clean-clone test. Generated database credentials remained private. A new dedicated local PostgreSQL 17 container and eight fresh databases were created; the runner stopped its own container afterward. No GCP operation was performed.

| Captured setting | Actual value |
| --- | --- |
| OS | macOS 26.6.2, Darwin kernel 25.6.0 |
| Architecture | arm64 |
| Python | 3.14.0 |
| Node | v24.22.1 |
| npm | 10.9.2 |
| Docker client / server | 29.8.2 / 29.8.2, Linux containers |
| Runner base commit | `9ee637852da194702c797b75311b1894afff190c` |
| Assessed source/config/test/tool files | 79 SHA-256 entries in `results.json` |
| Verification outcome | All 16 commands exited 0; 239 tests passed, 0 failed, 0 skipped |

Typecheck, API/web build, ORM and actual process-restart verification also passed. Test counts are the same matrix as the original implementation: 53 unit, 3 API, 7 cloud, 41 features, 7 release, 9 foundation, 2 database-tooling, 5 post-release, 84 UI recovery, 4 UI tooling, 22 real-domain UI and 2 logout UI. The two runs are separate executions of the same selected cases, not 478 distinct tests.

All 79 current file hashes were checked against the assessed source after execution. Compared with the original implementation record, the only changed assessed file is `scripts/verify-lab5-episode2.py`; application, test, package and environment-example files are unchanged. Documentation changes are outside that source hash map. Original raw results, RED, failure records and command logs remain byte-for-byte intact.

`platform-guard.txt` records a **simulated** `sys.platform='win32'` check with subprocess launching mocked: the runner exits with WSL/macOS/Linux instructions before any subprocess. This is not an actual Windows run or Windows compatibility claim. `history-guard.txt` records an actual refusal to overwrite the existing original `results.json`; its SHA-256 stayed unchanged. These two tooling checks are separate from the 239 application/regression test count.

This run establishes a successful supported **macOS** environment. Linux/WSL reproduction steps are documented, but neither Linux nor WSL was executed here. Results are author-executed evidence, not independent reviewer verification. Teammate acceptance/merge into staging remain pending.

See [supported environments and exact WSL commands](../../../deployment.md#supported-episode-2-verification-environment) and [Episode 2 checklist](../../../episode-2-cloud-readiness.md).
