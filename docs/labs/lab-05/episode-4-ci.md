# Lab 5 Episode 4 — CI on pull requests

Issue [#55](https://github.com/Maibokdaimhai/LECTRA/issues/55), branch `ci/55-pr-checks` from accepted Episode 3 staging merge `e4eeec9e29f1eab7c12fbce03657c3480e7c0e80`.

## Guide requirements and completion gates

Student Guide V1.1 Episode 4 §§4.1–4.5 (PDF pp. 38–43) requires the workflow and complete deploy folder, PR-triggered `test-and-docker` for both staging and main, and the workflow/deploy folder on main after a reviewed release. The Lab 5 handout overrides examples and requires meaningful tests/build plus review history. Guide issue/branch #4 is an example; LECTRA uses its actual issue number.

1. Open implementation PR into staging; verify the check starts automatically and passes.
2. Teammate reviews/approves and merges into staging.
3. Open release PR **from staging into main**; verify the same check starts/passes, then obtain teammate approval/merge.
4. Confirm workflow and deploy files on main and record actual commit/run evidence. Only then close #55 / Kanban Done.

A green implementation check alone does not complete Episode 4. Required-check branch rules and the deliberate failing-PR merge-block demonstration are Episode 6; this episode does not claim a merge gate exists or silently change branch protection. No agent self-approval/merge substitutes for teammate review.

## Workflow review

`.github/workflows/ci-docker.yml` has name **CI & Docker Build**, stable job **test-and-docker**, `pull_request.branches: [main, staging]`, `workflow_call`, `workflow_dispatch`, cancellation of superseded runs and `contents: read` only. There are no path filters that skip documentation PRs, no GCP authentication, no id-token permission, no application/cloud secrets, no image push/deploy and no continue-on-error on required validation. Checkout does not persist credentials.

Actions are pinned to actual official release commit SHAs: checkout v7.0.1, setup-node v7.1.0, setup-python v7.1.0 and upload-artifact v7.0.2, resolved from their official GitHub repositories rather than invented. Ubuntu 24.04, Node 24.22.1, npm 10.9.2, Python 3.14 and PostgreSQL 17 are the selected toolchain. These exact choices and the artifact strategy are team implementation decisions, not universal instructor-mandated versions.

| Step | Actual intended work |
| --- | --- |
| Checkout/setup/install | Fresh checkout, pinned runtimes, npm ci and Chromium with Ubuntu system dependencies |
| PostgreSQL service | Disposable loopback CI control database; `lectra_ci_only` is an isolated job fixture credential, not an application/cloud password |
| Offline deployment tests | Syntax + six deployment and five release stub scenarios, ten Python guard/smoke tests; four existing verifier-environment tests run separately |
| Full application matrix | Eight NEW isolated databases, actual migrations/seed, 249 selected unit/API/real-PG/browser tests, typecheck/build, ORM and built-process restart |
| Docker verification | Build API/nginx/unified root images without pushing, run real packaged API/Chromium/persistence checks, assert unified image architecture amd64 |
| Evidence upload | Upload only sanitized `.local/ci-evidence/` and `.local/ci-docker/`, including logs/source hashes/images, even on failure; 90-day retention |

CI service mode extends the tested regression runner while preserving its local-container mode. `scripts/prepare-ci-databases.mjs` permits only fixed disposable control credentials/loopback and hardcoded test names, refuses existing test databases, and never resets a deployed database or reads a production DATABASE_URL. Test role passwords/session secrets are generated per run and redacted from logs. CI records the actual tested checkout SHA plus run/event/PR commit metadata; a PR may test a synthetic merge checkout, so do not substitute the branch SHA for that assessed checkout.

The Docker step runs on the Ubuntu amd64 runner with DOCKER_DEFAULT_PLATFORM=linux/amd64. Its actual result, not that configuration alone, establishes a successful amd64 build/runtime check. It still does not establish a Cloud Run deployment or actual TLS endpoint.

## Deployment templates

The whole starter deploy set is included with LECTRA naming/PostgreSQL 17 and a real LECTRA cookie/CSRF smoke client. [Deploy preparation notes](../../../deploy/README.md) identify pending live-environment adaptation. An offline guard prevents accidental live execution until Episode 5 review. Stub success proves template flow, not cloud readiness; the starter's Cloud SQL socket and secret/bootstrap mappings are explicitly not declared production-ready. This is intentional Episode 4 preparation, not an invented instructor prohibition on live tooling.

## Evidence and current status

See [Episode 4 evidence index](evidence/episode-4/README.md). Local service-mode reproduction passed 249 tests and all 17 matrix commands, plus offline and Python tooling checks. It is local author evidence, not a GitHub Actions result. The local record predates addition of GitHub run-metadata capture to the runner; current assessed workflow/source evidence must come from the actual PR run and artifact.

At implementation time the reviewed staging/main integration gates remain pending. Do not mark this issue Done or claim the workflow is already on main until those facts are verified. [Actual successful implementation run 43580925042](evidence/episode-4/github-run-43580925042/README.md) records all step outcomes, extracted artifacts, 249 passing selected application tests, 30 Docker checks and actual amd64 images. Its branch head is `bec735b`; its tested synthetic merge is `d6ca26b`. Captioned screenshots and logs are retained. Main-target release evidence is still pending.

## References

- Student Guide V1.1 Episode 4 §§4.1–4.5; Lab 5 handout R-05, R-06, R-09, R-10 and evidence requirements.
- [GitHub workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax) for PR filters, reusable/manual triggers, permissions and concurrency.
- [GitHub PostgreSQL services](https://docs.github.com/en/actions/tutorials/use-containerized-services/create-postgresql-service-containers) for an Ubuntu-hosted disposable database.
