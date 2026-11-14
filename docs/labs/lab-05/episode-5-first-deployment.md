# Episode 5 — operator-run first cloud deployment

Issue [#59](https://github.com/Maibokdaimhai/LECTRA/issues/59). **Preparation only: the user explicitly reserves all GCP/Cloud Shell operations for themselves. No agent cloud reads, writes or deployment are authorized.** Local tests and cloud command templates below are not cloud execution evidence.

## Guide requirements versus LECTRA decisions

Student Guide V1.1 Episode 5 §§5.0–5.8, PDF pp.44–55, requires adapting the starter, running a no-change preview in Cloud Shell, deploying the reviewed main manually, Cloud Run + managed database, public app/login/readiness and resource/screenshot evidence. The Lab 5 handout takes precedence. The guide's no-branch example assumes no script changes. This adaptation needs a branch/reviewed PR because Episode 4 deliberately retained offline-only templates.

Team choices: PostgreSQL 17, `lectra`/`lectra-pg`, exact Cloud SQL socket opt-in, generated session secret, explicit synthetic owner/respondent bootstrap, deterministic HTTPS origin and commit/digest pinning. Region `asia-southeast1` is a proposed default, **not yet operator-confirmed**. These choices are not additional instructor requirements.

LECTRA has owner/respondent roles, no administrator role or first-login password-change feature. Guide §5.6 is a TokTickIT-specific example; do not invent that workflow or claim it was tested. The operator obtains synthetic role credentials privately, using Secret Manager, without screenshots or posting values. Demo credentials are lab-only, and all fixtures are synthetic. Do not admit real student data into this lab deployment.

## Adapted resource plan

| Resource | LECTRA setting and purpose |
| --- | --- |
| Artifact Registry | `lectra`, image `lectra:<reviewed-main-SHA>`; Cloud Build, then resolve immutable digest |
| Cloud SQL | `lectra-pg`, PostgreSQL 17 Enterprise, db-f1-micro, 10GB SSD, auto-increase disabled at creation and patched for existing instance |
| Database/user | `lectra`; no migration reset, no public IP allowlist added by this script |
| Runtime identity | `lectra-runner`; project Cloud SQL Client, Secret Accessor only on named app secrets |
| Runtime secrets | `lectra-database-url`, `lectra-session-secret`; generated once/reused, no application secrets in source/build args |
| Optional lab credentials | `lectra-owner-password`, `lectra-respondent-password`; generated separately, only with explicit `--demo` |
| Migration job | `lectra-migrate`, `npm run db:migrate:production`, explicit matching database + socket, max retries 0, timeout300s; executes before service update |
| Optional bootstrap job | `lectra-bootstrap`, `npm run db:seed:production`; separate target confirmation, insert/verify transaction, never overwrite conflicting existing fixture data |
| Cloud Run service | `lectra`, unified image, PORT3001, min0/max3, CPU1/memory512Mi, public app entry while domain APIs still enforce authentication |
| Runtime env | production, UTC, `TRUST_PROXY=1`, exact deterministic HTTPS `APP_ORIGIN`; stable session key from Secret Manager |

Cloud SQL incurs ongoing charges while the instance exists, even with no requests. Budget alerts do not stop spending. The operator should plan Episodes5–8 close together and use the reviewed Episode8 teardown when finished. No resource cleanup is executed by the agent. The current teardown/release scripts remain offline-gated and require later episode adaptation, including the new session/role secrets and bootstrap job.

## Connection and origin contracts

The database URL uses authority `localhost`, database `lectra` and **one** `host=/cloudsql/PROJECT:REGION:lectra-pg` query parameter, plus schema/public and connection_limit3. Operational migrate/seed additionally require `ALLOW_CLOUD_SQL_INSTANCE` to match the socket exactly and `ALLOW_PRODUCTION_DATABASE=lectra`. Host/port overrides otherwise remain refused. Duplicates, aliases, mismatched sockets, unknown query options and opt-in without a socket fail before connecting. pg, Prisma migrations and the Prisma pg adapter are rehearsed against a real local PostgreSQL Unix socket. This proves the transport/command compatibility; it does not prove GCP IAM, Cloud SQL attachment or real HTTPS.

Cloud Run provides a deterministic URL `https://lectra-PROJECT_NUMBER.REGION.run.app`; the script obtains the project number and supplies this exact origin before the initial revision starts. Use that URL for login and evidence. A hashed Cloud Run alias may serve the page but is not the allowed login Origin. The proxy choice represents the single trusted Cloud Run TLS-termination hop; it is not inferred from arbitrary client headers. Local socket login tests simulate that hop and are labelled as such.

## Before the operator executes anything

1. Review the adaptation PR, merge into staging, then use the normal teammate-reviewed staging→main release. CI and Docker/socket checks must pass on the final release head.
2. Confirm project, region, active trial/billing, Episode1 budget alerts and cost/cleanup plan yourself. Existing team Admin IAM is the user's accepted choice; do not assign broad roles to the runtime identity.
3. Confirm your account can enable APIs/create resources, act as the runtime identity, and submit Cloud Build. Inspect the actual Cloud Build service account's source/artifact/log permissions if build submission is denied; do not blindly grant project Editor/Owner.
4. Use Cloud Shell signed into the intended account. Keep password retrieval and sign-in private; do not enable shell tracing/HTTP debug logs. The script refuses `bash -x` execution and disables gcloud HTTP logging.
5. Verify `.gcloudignore` upload exclusions: no .env, .local, keys, credential JSON, local evidence or dependencies are uploaded as Cloud Build source.

## Operator commands — not executed by the agent

These are templates for the user after the reviewed adaptation reaches main. Replace project/region yourself. The shown region is a proposed default.

```sh
export PROJECT_ID=YOUR_PROJECT_ID
export REGION=asia-southeast1
gcloud auth list --filter=status:ACTIVE --format='value(account)'
gcloud config set project "$PROJECT_ID"
gcloud billing projects describe "$PROJECT_ID" --format='value(billingEnabled)'
# In an existing clean LECTRA checkout, do not clone over another folder:
git switch main
git pull --ff-only origin main
git status --short
git rev-parse HEAD
# Compare to the latest reviewed main on GitHub.
DRY_RUN=1 PROJECT_ID="$PROJECT_ID" REGION="$REGION" bash deploy/deploy.sh --demo
```

Read the plan: APIs → registry → SQL and fixed storage → database → identity → generated secrets/secret-level access → commit-tagged build/digest → forward-only migration → explicit synthetic bootstrap → service. Preview uses a fake project number/image placeholder, makes zero gcloud calls and is not proof resources exist.

Only when you choose to provision and accept the costs yourself:

```sh
# --demo explicitly creates the synthetic classroom/accounts required to try login.
# Omit it only if you already have a separately provisioned, verified account policy.
ALLOW_LIVE_GCP_PROJECT="$PROJECT_ID" PROJECT_ID="$PROJECT_ID" REGION="$REGION" \
  bash deploy/deploy.sh --demo
```

The live guard requires the repository root, clean `main` and HEAD equal to the current origin/main tip. It refuses feature branches and modified checkouts. The script prints no credential values. It stops before service deployment on migration/bootstrap failure. A successful rerun reuses existing credentials, schema and verified fixture rows. If a database user exists but the URL secret is absent, it refuses credential rotation; inspect/repair privately before retrying. Likewise a secret lacking an enabled version requires private repair. No automated reset or destructive recovery is offered.

## Operator verification and evidence checklist

After actual success, use the **canonical URL printed by the script**, not an inferred or hashed alias:

```sh
export SERVICE_URL=https://lectra-PROJECT_NUMBER.REGION.run.app
curl --fail "$SERVICE_URL/api/health"
curl --fail "$SERVICE_URL/api/ready"
python3 deploy/smoke_test.py "$SERVICE_URL"
gcloud sql instances describe lectra-pg --project "$PROJECT_ID" \
  --format='yaml(databaseVersion,region,settings.tier,settings.dataDiskSizeGb,settings.storageAutoResize)'
gcloud run services describe lectra --project "$PROJECT_ID" --region "$REGION" \
  --format='yaml(status.latestReadyRevisionName,spec.template.spec.serviceAccountName,spec.template.spec.containers)'
```

Only secret **references/names** belong in service metadata. Review output before posting. Do not capture Secret Manager's value page or a password retrieval command/output. Retrieve role credentials privately yourself; do not paste them into chat/Issue/docs. Optional authenticated `SMOKE_EMAIL`/`SMOKE_PASSWORD` can be supplied privately in your local process environment; the smoke test logs no values and performs session login/context reads/logout, not domain writes.

Capture these actual, captioned screenshots and logs:

- Public URL + login page, without Google sign-in; successful owner identity, then logout/rejected session. Keep password fields/retrieval off camera.
- Real `/api/health` and `/api/ready` success; readiness must prove managed DB connectivity.
- Create/publish/respond/close a synthetic survey, stored results; open a new session or redeploy the same immutable image and show data remains. Record actual steps/results without inventing a restart.
- APIs enabled: Cloud Run, SQL Admin, Artifact Registry, Cloud Build, Secret Manager, IAM.
- Runtime SA project role Cloud SQL Client and secret-level Secret Accessor; account names only as appropriate, no private tokens.
- Cloud SQL instance/database/engine/tier/disk and auto-increase OFF.
- Secret names and Permissions tab only; never View secret value.
- Cloud Run image digest, revision, PORT/env and secret references; min0/max3.
- Artifact Registry image, Cloud Build result, successful migration/bootstrap executions, main SHA and actual deployed URL.

Post the actual service URL and captioned screenshots to #59, retain sanitized source evidence under `evidence/episode-5/`, and only then decide acceptance/Done. A local rehearsal, stub pass, configured script or reviewed PR alone cannot close this issue. Cloud results are currently **Not executed / reserved for the user**.

## References

- Instructor Student Guide V1.1 Episode5 §§5.0–5.8 and Lab5 handout.
- [Cloud Run deterministic service URL](https://docs.cloud.google.com/run/docs/triggering/https-request).
- [Cloud SQL connections from Cloud Run](https://docs.cloud.google.com/sql/docs/postgres/connect-run).
- [Prisma PostgreSQL connection configuration](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql).
