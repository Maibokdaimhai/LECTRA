# Deployment scripts imported for Episode 4 offline CI

The complete Lab 5 starter `deploy/` set is retained and adapted to the LECTRA name/PostgreSQL 17. These are **prepared templates, not a reviewed live LECTRA deployment**. Episode 4 checks syntax, stubbed command flows and the LECTRA smoke protocol. No real GCP authentication, provisioning, deployment or teardown was executed.

`deploy.sh` and `teardown.sh` permit `DRY_RUN=1` previews without cloud calls. All non-preview execution, including `release.sh`, requires the offline test harness's marked gcloud executable; otherwise `offline_guard.sh` refuses before resolving cloud configuration or changing resources. `release.sh` has no implemented dry-run mode, so DRY_RUN cannot bypass that guard. The marker is an offline test convention, not a security boundary against someone deliberately editing the scripts.

```sh
bash deploy/tests/check_offline.sh
DRY_RUN=1 bash deploy/deploy.sh --demo
DRY_RUN=1 bash deploy/teardown.sh
```

The checker runs shell syntax checks, six deployment-stub scenarios, five release-stub scenarios and ten Python tests for guards/smoke. All gcloud/openssl deployment-test calls are local stubs; Python smoke tests mock the transport. The smoke client uses actual LECTRA envelopes, cookie sessions, CSRF bootstrap/rotation and Origin checks, not TokTickIT categories or bearer tokens. Public checks cover health, readiness and SPA; optional privately supplied SMOKE_EMAIL/SMOKE_PASSWORD add login, identity/context reads and logout. Partial credential configuration fails before network access. No credential is printed.

## Required Episode 5 adaptation before live use

- Select and verify a Cloud SQL connection method compatible with pg/Prisma and LECTRA's routing-override guards; the starter Unix-socket URL is not currently accepted by the production operator guard.
- Review actual project/region/resources and runtime/migration identities and secret access with the human operator; names here are proposed defaults, not a claim that resources exist.
- Wire HTTPS APP_ORIGIN, stable SESSION_SECRET, proxy policy and the actual production migration target confirmation. The imported job/service flags still require that adaptation.
- Replace legacy starter admin/demo variable mappings with LECTRA's explicit owner/respondent bootstrap policy; do not automatically reseed on every release. No first-login admin workflow is claimed by these templates.
- Verify compatible linux/amd64/multi-platform image build/runtime and actual HTTPS login/readiness/persistence before declaring cloud deployment successful.
- Only after a reviewed Episode 5 implementation may the offline-only guard be replaced with the actual approved operational controls. Episode 7 release/pipeline adaptation and end-of-term teardown require their own review; never delete a cloud database just because a stub test passes.

Offline tests prove the current template command flow and fail-fast behavior; they do not establish working cloud configuration or authorize running the scripts against an account.
