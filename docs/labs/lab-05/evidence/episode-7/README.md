# Episode 7 preparation evidence

Issue: https://github.com/Maibokdaimhai/LECTRA/issues/65

- `local-red.txt`: actual pre-fix release-contract run (7 tests; 10 failing subcases across validation tests). Only local worktree path was replaced with `[WORKTREE]`; original assertions/results preserved. Raw source output remains in the temporary local evidence.
- `local-green.txt`: actual complete offline suite after adaptation: 25 Python tests pass, plus 6 deployment shell scenarios and 5 release shell scenarios. Every gcloud executable in these tests is a local marked stub; guard-only acceptance tests execute no cloud commands. Mock smoke output is not a live-service smoke result.
- `actionlint.txt`: actionlint 1.7.12 validates deploy and existing CI workflows, exit 0, no diagnostics. Shellcheck integration explicitly disabled because it is not installed; this is not a shellcheck result.
- `local-verification.json`: tested working-tree source hashes, original main base SHA and environment. These hashes bind local evidence to the code; GitHub PR CI will separately bind a run to the committed head. No passing PR CI result is asserted in this initial record.

Historical Sprint 1/Episodes 2-6 evidence is untouched. No GCP authentication, deploy, IAM query, token exchange or new cloud resource creation was performed. Episode 7 remains open until first and second genuine merge-triggered releases and operator-supplied resource evidence satisfy the runbook. Do not insert synthetic success screenshots or mark the episode Done from this preparation PR.
