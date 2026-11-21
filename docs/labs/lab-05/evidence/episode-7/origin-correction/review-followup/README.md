# PR68 review follow-up - pre-mutation origin validation

Addresses the review's Major (late APP_ORIGIN validation) and Minor (DNS labels and mixed value/valueFrom) findings. The new tests were run against the previous implementation before changing production source: parser 3 tests / 6 failing subcases; release contract 9 tests / 14 failing subcases. These are offline RED results, not live production experiments. Logs replace only absolute worktree path with [WORKTREE].

After correction: parser 3/3, release-contract 9/9, full offline deployment suite 30/30 Python tests, 6 deploy shell scenarios and 5 release shell scenarios passed. actionlint 1.7.12 passed with shellcheck integration disabled. Source hashes identify the exact tested working-tree files; PR CI binds the subsequent commit independently. Historical 27-test evidence and successful first-release records remain untouched.

The successful normal and rollback paths now assert service/origin read precedes every Cloud Run mutation. The ten normal/rollback combinations (missing, duplicate, malformed hostname, secret-only reference and mixed value/valueFrom) assert only image/service reads occur, no success URL is printed and no workflow environment output is written. Existing migration/service/traffic failure checks assert no premature export. DNS parser checks include empty labels, leading/trailing hyphens, label/hostname length limits and ambiguous literal/secret entries (including empty/null valueFrom).

No live GCP operation, deployment, IAM/secret query, workflow dispatch or merge was executed. Review/CI/release acceptance is tracked in PR #68 and Issue #65; no deployed correction is claimed.
