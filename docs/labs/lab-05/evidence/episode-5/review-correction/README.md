# PR #60 review correction — bounded database connections

Reviewer R1NNE0 requested changes on head `938c7e6` (review5906695581): Major runtime pool limit and Minor fresh Cloud Shell checkout instructions. No GCP operation is part of this correction; the user retains all Cloud Shell/GCP execution.

## Corrected behavior and budget

- Actual HTTP auth/session/domain pool has explicit max3; no reliance on Prisma's URL parameter.
- Prisma adapter receives its own actual pg pool, explicit max1, with disposal ownership enabled.
- Production preflight, explicit seed and local/dev/test migration wrappers use operator max1. Preflight ends before migration CLI starts; the CLI receives connection_limit1 while preserving database/socket/schema.
- Current HTTP server constructs only the shared runtime pool. Budget additionally reserves one reused Prisma adapter per service process: 3 instances ×(3+1) +1 sequential operator connection =13. At verified capacity>=25, normal headroom is12. Do not construct clients per request or run overlapping operator executions/additional services without recalculating the budget.
- Deploy configuration sets service-level max3 plus revision max3, jobs tasks1/parallelism1/retries0. Capacity is read from PostgreSQL before Cloud SQL migrate/seed and values below25 are refused. Cloud Run's potential temporary overrun is documented rather than described as a hard database admission cap.
- Fresh clone refuses an existing directory/file/symlink. Existing-checkout instructions retain normal safe main/ff-only update and preservation of changes.

## Actual local evidence

- `initial-missing-module.txt`: first invocation of the new complete test file before its new module existed; import failure, not a behavioral RED result.
- `runtime-red.txt`: actual R60-P01 test against the pre-fix application, proving effective pool max was10 while3 was expected. A temporary standalone harness ran the same persistent R60-P01 assertion; removed afterward. This is newly executed evidence, not rewritten historical test evidence.
- `pools-green.txt`: all five persistent focused regressions passed, including actual runtime/Prisma pool objects, operator limit, CLI target preservation and capacity boundaries.
- `typecheck.txt`: actual successful typecheck.
- `offline.txt`: actual successful six deployment scenarios, five release scenarios and13 Python tests. Includes assertions for service-level max and single-task migration settings.
- `socket/`: actual local Docker build and real PostgreSQL socket rehearsal, all13 command records exit0 (11 operational/build checks plus2 container cleanup commands). Three/one/one real clients fill the runtime/Prisma/operator pools respectively; an additional acquisition queues then resumes when a held client releases. Two migrations, two seed runs, Prisma adapter query, readiness/SPA and login/logout also pass. Source hashes identify the reviewed working tree at execution, not the old base commit alone.

Existing259-test CI and earlier local records are preserved as historical results for the earlier head. Updated full PR CI is reported against the new correction commit on GitHub; no earlier pass is substituted for changed source.
