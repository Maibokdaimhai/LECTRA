# Episode 4 evidence index

## Local preparation evidence

- `local-offline-tests.txt`: actual six deploy-stub scenarios, five release-stub scenarios and ten Python tests, with no real cloud/network deployment calls.
- `local-tooling-tests.txt`: four existing Python verifier-environment tests passed.
- `local-service-reproduction/`: actual local PostgreSQL-service reproduction; eight new isolated test databases, **249 selected tests passed**, all **17 commands** (including database preparation) exited 0, plus typecheck/build/ORM/restart. It used macOS/arm64 and a new local Docker service, not GitHub Actions. The runner subsequently gained GitHub-only metadata capture, so this earlier snapshot is not asserted to be the final workflow hash.

## GitHub evidence

[Actual successful GitHub run 43580925042](github-run-43580925042/README.md) retains run/job/artifact metadata, 249 passing selected application tests, 30 passing Docker checks, logs, source hashes and five captioned Chromium screenshots. All 104 regression and 80 Docker hashes matched at collection. A configured workflow is not evidence that it ran; a staging pass is not evidence of a main-target release pass. The retained workflow/deploy files must reach main through teammate-reviewed integration/release before Episode 4 is complete.

The workflow uploads sanitized logs/results/source hashes and actual Docker browser screenshots as a per-run GitHub artifact. Private `.local/episode3` environment/cookie files and repository `.env` files are not uploaded. Historical Sprint 1/Episodes 2–3 evidence remains unchanged. Current expected selected application matrix is 249; Python and shell offline checks are separate counts, not added to that historical matrix.

[Actual successful main-target release run 43584455186](github-run-43584455186/README.md) independently repeats the full matrix and amd64 Docker checks for staging head `b501940`. PR #56 is approved and merged. PR #57 still requires final evidence integration, latest check, teammate approval and main merge.
