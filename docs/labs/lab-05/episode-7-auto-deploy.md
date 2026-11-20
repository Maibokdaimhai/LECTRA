# Episode 7 - automatic deployment and smoke verification

Tracking: [Issue #65](https://github.com/Maibokdaimhai/LECTRA/issues/65). Guide: Student Guide V1.1, PDF pp.81-91, sections 7.1-7.7. This document separates the guide's completion conditions from LECTRA implementation choices. **Preparation/PR is not completion of Episode 7. No live Episode 7 authentication or deployment has been performed by the agent.**

## Guide requirements and LECTRA adaptation

| Guide stage | LECTRA implementation | Evidence / completion gate |
| --- | --- | --- |
| 7.1 understand provided workflow | Adapt the starter kit's `deploy.yml`; retain its test/deploy jobs, trigger and release sequence | Source diff and local verification |
| 7.2 match existing names | Service `lectra`; migration job `lectra-migrate`; registry/image `lectra/lectra`; environment `demo` | Names match operator's Episode 5/6 screenshots; no new cloud queries |
| 7.3 optional login | Initially skip intentionally: neither `SMOKE_EMAIL` variable nor `SMOKE_PASSWORD` secret. Existing client supports LECTRA cookie/CSRF login, identity/context and logout | Public checks must pass; a genuine optional SKIP is acceptable under the guide |
| 7.4 deliver workflow to main | Feature PR into staging, teammate review/green CI, then separate reviewed staging-to-main release PR | Main merge SHA and automatically started `Deploy demo` run |
| 7.5 observe release | Reuse CI, WIF, root Docker image on linux/amd64, full-SHA tag, resolve immutable digest, await migration, update service/traffic, smoke and summary | Actual successful Actions run, including auth, migration and smoke |
| 7.6 compare cloud resources | Operator checks latest revision 100% traffic, full image digest equality, successful migration execution, matching registry SHA tag | Captioned actual GCP screenshots supplied by the operator |
| 7.7 repeat | Only after first success, sync staging and branch `feature/deploy-proof`; make a visible change and repeat reviewed staging/main PRs | Second automatic green run, new revision and visible public change |

TokTickIT/category endpoints are examples. LECTRA public checks are `/api/health`, `/api/ready` (DB connected), and `/` (HTML). `/api/courses` requires authentication and is checked only by optional authenticated smoke. Do not make it public for the lab. Optional login requires a dedicated least-privilege test account with a separate password, not the seeded owner/demo credentials. Set both values or neither; never paste credentials into issues/screenshots.

## Preparation and safeguards (LECTRA choices)

- Staging was fast-forwarded from `807f1922af71abe05c2842b6c64d77bcbd8c3a6d` to main `39f868644ffda1c8f220ef47957408dab986bc4f` before `feature/auto-deploy` was created. No history rewrite or merge into main was performed.
- The workflow is adapted from `02_lab5-starter-kit.zip` (`toktickit-lab5-starter/.github/workflows/deploy.yml`); existing customized CI was preserved. No new CI package dependency is needed. Action pins from the kit are retained; deploy runner is Ubuntu 24.04 and image architecture is explicit linux/amd64.
- The workflow path, repository, main ref and `demo` environment must match the Episode 6 immutable OIDC subject/condition. The four environment variables come from `demo`; no project number or credential is hard-coded into workflow source. A manual run is main-only too.
- CI has contents:read only. Only the deploy job has id-token:write and `environment: demo`; the deployment waits for reusable CI success (except explicit existing-image rollback, retained from the kit for Episode 8). No pull_request deployment trigger is present.
- Release concurrency uses `deploy-demo` with cancellation disabled. The existing reusable CI concurrency group has a distinct `ci-` prefix, so it does not cancel its caller. Do not dispatch multiple manual releases while another release is pending; GitHub concurrency can replace pending runs.
- `release.sh` accepts live execution only in the exact repository/main/workflow context with explicit project opt-in, matching source SHA, repository root and clean checkout. This is an accidental-execution guard; **WIF/IAM provide cloud authorization**, not these spoofable environment strings. Local tests use marked fake gcloud executables only. DRY_RUN is not supported for release and cannot enable live execution.
- Release updates only image/traffic on pre-provisioned job/service. The job retains the guarded PostgreSQL migration command, Cloud SQL socket, service account and secret references established in Episode 5. The service retains APP_ORIGIN, session secret, DB socket, runtime identity and scaling settings. No seed, resource creation, IAM mutation, direct secret read or database reset occurs in this workflow.
- A full 64-hex digest under the expected project/repository is required. Migration job update/execution failure stops before service update. Service or traffic failure does not report successful deployment. No automatic rollback is claimed on smoke failure: the release may already be live; preserve the failed run and investigate, then follow Episode 8 if rollback is appropriate.
- Both `.dockerignore` and `.gitignore` exclude ephemeral `gha-creds-*.json` generated by the auth action. Credential files must never enter image context, source commits or evidence artifacts. The deploy job does not upload its workspace.
- Summary is written only after smoke success and records image tag, digest, URL and rollback mode. Optional-login outcome remains explicit in the smoke log; no skipped login is called a PASS.

## User-controlled release and evidence steps

1. Have the teammate review the preparation PR and its exact-head CI. Merge it into **staging** after approval. This alone does not deploy.
2. Open a separate release PR from staging into **main** (Part of #65); wait for the required `test-and-docker` and one teammate approval. The agent does not merge or dispatch live workflows. **Merging this workflow into main activates real automatic deployment and cloud resource updates.**
3. In Actions, open the automatically started `Deploy demo`. Capture the main release SHA, run ID/attempt, successful test/deploy jobs, successful keyless-authentication step, migration step and smoke output (`PASS /api/health`, `PASS /api/ready`, `PASS /`, optional login SKIP unless specifically configured). Do not print tokens or secret values.
4. Capture the run Summary's full commit image tag, digest and public URL. Record full values privately for comparison; redact project number/private identities where required in public screenshots.
5. Operator opens Cloud Run `lectra` Revision history: capture latest ready revision, 100% traffic and **full digest** matching the Actions summary. Capture `lectra-migrate` latest successful execution and Artifact Registry `lectra/lectra` with the same full commit SHA tag. Do not accept a truncated digest as proof of exact equality.
6. Open the public URL and capture working LECTRA. This is deployment availability evidence, not proof of all feedback/authorization/persistence requirements.
7. Only after steps 3-6 succeed: sync staging with main, create `feature/deploy-proof`, make a small visible change, test locally and repeat reviewed staging/main PRs. Record the second automatic run/new SHA/digest/revision and a browser screenshot showing that change. Do not manually deploy to satisfy this condition.
8. Attach captioned screenshots directly to Issue #65 with PR/run links and which release each image belongs to. Keep Issue/Kanban open until **both actual releases** satisfy the guide.

No extra cloud-account/IAM changes are authorized by this PR. If first authentication fails, the operator compares Episode 6 provider/subject/binding without weakening the condition. If a settings-only correction fixes a run, the guide permits the user to rerun all jobs; preserve original failed evidence. A code correction needs a reviewed PR.

## Verification and evidence provenance

See [local evidence](evidence/episode-7/README.md). Focused shell/Python tests mock every cloud invocation; passing them is not a successful cloud release. Actionlint validates workflow syntax/expressions locally. Full application/API/database/UI/Docker regression is performed by the existing PR CI and must be linked to its actual head. Historical Episode 4/5 and Sprint 1 results are not changed or combined with new test counts.

Official references used for implementation checks: [auth action credentials exclusion](https://github.com/google-github-actions/auth), [reusable workflow context/concurrency](https://docs.github.com/en/actions/reference/workflows-and-actions/reusing-workflow-configurations). The runtime action pins are inherited from the starter kit, not silently upgraded.


## First automatic run and configured-origin correction

[Run 44793979117](https://github.com/Maibokdaimhai/LECTRA/actions/runs/44793979117) on main `79b1cffbb615562fb6b57fc8cb260373abaf5f15` genuinely succeeded. Preserve its original summary/logs: the optional authenticated smoke was SKIP. The summary used Cloud Run's hashed status.url alias, while LECTRA retained its Episode 5 deterministic APP_ORIGIN for exact login Origin validation. Public smoke cannot establish successful login through that alias. The release correction reads the configured literal APP_ORIGIN from the service descriptor and exports only that safe origin, without printing the descriptor or weakening authentication. It fails if APP_ORIGIN is missing/ambiguous/unsafe; it does not fall back to the alias. Python setup precedes release parsing. See [separate correction evidence](evidence/episode-7/origin-correction/README.md); the original preparation evidence is untouched. The correction requires review/release before its result is claimed. Operator cloud screenshots and the visible second release remain pending.
