# LECTRA deployment entry points

Episode5 preparation adapts `deploy.sh` to LECTRA's real environment, guarded Cloud SQL socket, generated stable session key and optional explicit synthetic owner/respondent bootstrap. **No GCP execution is claimed. The user reserves all Cloud Shell/GCP work for themselves.**

See [Episode5 operator runbook](../docs/labs/lab-05/episode-5-first-deployment.md) for review/main prerequisites, the actual plan, private credential handling and every required evidence item.

```sh
bash deploy/tests/check_offline.sh
DRY_RUN=1 bash deploy/deploy.sh --demo
```

Preview makes no cloud calls. Live first deployment requires exact `ALLOW_LIVE_GCP_PROJECT` confirmation plus a clean latest main checkout. No secrets are generated at preview time. CI uses marked local gcloud/openssl stubs; guard/smoke tests make no live deployment calls. The local Docker socket rehearsal verifies actual pg/Prisma migrations, safe repeated seed, runtime readiness and auth against a Unix socket, independently of GCP.

`release.sh` and `teardown.sh` remain **offline-only prepared templates** for Episodes7/8. Their DB/session/bootstrap/secret mapping must be adapted and reviewed before live use. `release.sh` has no dry-run bypass; `teardown.sh` permits preview only. No deletion, IAM/provisioning or GCP authentication is performed by the agent.

`smoke_test.py` speaks LECTRA's cookie/CSRF protocol: public health/readiness/SPA, optional privately supplied `SMOKE_EMAIL` + `SMOKE_PASSWORD` for login, identity/context reads and logout. Partial credentials fail before network access. Smoke tests do not create feedback; the operator supplies actual persistence evidence separately.
