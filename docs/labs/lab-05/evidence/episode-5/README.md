# Episode 5 preparation evidence — not a cloud deployment

The user explicitly instructed the agent not to access or change GCP/Cloud Shell and will execute those steps themselves. **No GCP API, credential lookup, resource creation, IAM change, build submission or deployment was performed by the agent.** The issue must remain open until the operator's actual cloud evidence is available.

## Actual local records

- `socket-initial-config-error.txt`: initial test invocation used a nonexistent config and failed before tests ran. This is a tooling error, not a RED behavior result.
- `socket-red.txt`: controlled reproduction of the new cases against the pre-change database guard. EP5-S01 (valid selected socket) and EP5-S02 (opt-in without a socket) failed as expected. This was a deliberate baseline comparison after drafting tests/implementation, not a fabricated historical TDD sequence.
- `socket-green-initial.txt`: initial corrected guard, 15 focused tests passed.
- `socket-green.txt`: strengthened final guard, 17 focused tests passed (includes rejection of mismatched schema/connection limit).
- `offline-tests.txt`, `offline-tests-final.txt`: actual offline shell/stub and Python runs. Final run: six deploy scenarios, five release scenarios, 13 Python smoke/guard tests. The partial-credential state now deliberately refuses instead of rotating an existing DB password.
- `local-socket-rehearsal/`: failed first Docker fixture: only custom socket configured, so PostgreSQL initdb's internal setup could not find its default socket. Driver/migration command failed; preserved without claiming a product regression.
- `local-socket-corrected/`: second fixture attempt retained the startup-readiness correction, but still lacked the default initdb socket. Failed readiness; preserved.
- `local-socket-verified/`: corrected fixture retained the default socket plus the Cloud SQL-style socket. Actual Docker build, two forward-only migrations, two seed insert/verify runs, Prisma adapter query (seven synthetic accounts), app readiness/health/SPA, login with Secure host cookie, authenticated identity, logout and rejected subsequent identity all passed. Local simulated TLS-termination headers are labelled; these are not real HTTPS/GCP checks.

The local Docker runner saves actual base commit and SHA-256 source hashes: these executions test a working-tree adaptation based on `6ed6ff2`, not an assertion that the old base commit already contained the change. `local-socket-verified/` predates the final additional schema/limit checks and deploy-script documentation cleanup; its original source hashes are retained. `local-socket-final/` repeats all ten operational steps successfully against the final guard and rehearsal implementation, plus two successful container-stop cleanup commands. All 87 source hashes captured at start match the prepared executable/deploy files at collection. The forthcoming PR CI checks the committed source afresh. Previous failures are not overwritten or added into successful totals.

No private `.local/episode5-private` environment files or cookie values are included. Each rehearsal stops only its own generated local containers and retains its volumes; no GCP cleanup is performed. The current named rehearsal volume carries socket files, while PostgreSQL's data volume remains attached to its stopped container. No production data is used.

## Completion evidence still missing by design

Actual operator-confirmed project/region/budget, reviewed main SHA used in Cloud Shell, dry-run, Cloud Build/image digest, Cloud SQL/IAM/secrets metadata, migration/bootstrap jobs, public canonical service URL, real HTTPS login/readiness/persistence and captioned guide §§5.5/5.7 screenshots remain **Not executed by agent / reserved for the user**. See the [operator runbook](../../episode-5-first-deployment.md). Offline/local successes cannot close #59.

## PR #60 review correction

[Bounded-pool correction evidence](review-correction/README.md) records the real default10→max3 RED/GREEN result, five focused regressions, capacity/budget decisions and actual PostgreSQL pool-queue verification. Earlier CI/local records remain historical and are not rewritten.
