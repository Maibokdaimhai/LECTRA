#!/usr/bin/env bash
set -euo pipefail
case $- in *x*) set +x; echo 'Refusing shell tracing for secret-bearing operations.' >&2; exit 2 ;; esac
export CLOUDSDK_CORE_LOG_HTTP=false CLOUDSDK_CORE_VERBOSITY=warning

# Episode 5: explicit reviewed-main operator deployment. Preview remains offline.
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/offline_guard.sh"
require_first_deployment_execution


# Manual first deployment; run only after this adaptation is reviewed into main.
# Required live opt-in: PROJECT_ID and matching ALLOW_LIVE_GCP_PROJECT.
# REGION defaults to asia-southeast1; DRY_RUN=1 performs no gcloud calls.
# --demo explicitly creates/verifies synthetic owner/respondent fixtures in a
# separate job. Ordinary migration and application startup never seed.
# Secrets are generated once in Secret Manager; values are never printed.
# release.sh and teardown.sh remain gated until their later guide episodes.
# See docs/labs/lab-05/episode-5-first-deployment.md for operator/evidence steps.

# ------------------------------------------------------------------------------
# Settings & argument parsing
# ------------------------------------------------------------------------------
DRY_RUN="${DRY_RUN:-0}"
# CHANGE ME: default region if your group uses another one.
REGION="${REGION:-asia-southeast1}"
SEED_DEMO_DATA="false"
[[ "$REGION" =~ ^[a-z]+-[a-z]+[0-9]$ ]] || { echo 'Invalid region.' >&2; exit 2; }

for arg in "$@"; do
  case "$arg" in
    --demo)
      SEED_DEMO_DATA="true"
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      echo "Usage: $0 [--demo]" >&2
      exit 1
      ;;
  esac
done

# Helper: prints the command (DRY_RUN=1) or prints then executes it.
run_cmd() {
  # Log the command without exposing generated database credentials.
  local arg
  if [ "$DRY_RUN" = "1" ]; then
    printf '[DRY_RUN] '
  else
    printf '+ '
  fi
  for arg in "$@"; do
    case "$arg" in
      --password=*) printf '%s ' '--password=<REDACTED>' ;;
      *) printf '%q ' "$arg" ;;
    esac
  done
  printf '\n'
  if [ "$DRY_RUN" != "1" ]; then
    "$@"
  fi
}

# Live execution requires explicit project confirmation; preview may use a placeholder.
if [ "$DRY_RUN" = "1" ]; then
  PROJECT_ID="${PROJECT_ID:-example-gcp-project}"
else
  PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || true)}"
  if [ -z "$PROJECT_ID" ]; then
    echo "Error: PROJECT_ID is not set and no active gcloud project was found." >&2
    echo "Run: gcloud config set project YOUR_PROJECT_ID" >&2
    exit 1
  fi
fi

[[ "$PROJECT_ID" =~ ^[a-z][a-z0-9-]{4,28}[a-z0-9]$ ]] || { echo 'Invalid project ID.' >&2; exit 2; }
if [ "$DRY_RUN" = 1 ]; then
  SOURCE_SHA="<REVIEWED_MAIN_SHA>"
  PROJECT_NUMBER="123456789012"
else
  SOURCE_SHA="$(git rev-parse HEAD)"
  PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
  [[ "$PROJECT_NUMBER" =~ ^[0-9]+$ ]] || { echo 'Missing project number.' >&2; exit 2; }
  [[ "$(gcloud billing projects describe "$PROJECT_ID" --format='value(billingEnabled)')" == True ]] || { echo 'Billing is not enabled.' >&2; exit 2; }
fi

# ------------------------------------------------------------------------------
# Resource names
# Keep resource names consistent with the later release/teardown adaptations.
# ------------------------------------------------------------------------------
REPO_NAME="lectra"
SQL_INSTANCE="lectra-pg"
DB_NAME="lectra"
DB_USER="lectra"
SERVICE_NAME="lectra"
MIGRATE_JOB_NAME="lectra-migrate"
SA_NAME="lectra-runner"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
SQL_CONN_NAME="${PROJECT_ID}:${REGION}:${SQL_INSTANCE}"
IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}:${SOURCE_SHA}"
APP_ORIGIN="https://${SERVICE_NAME}-${PROJECT_NUMBER}.${REGION}.run.app"

# Secret Manager secret names (values are never stored in this repo).
SECRET_DB_URL="lectra-database-url"
SECRET_SESSION="lectra-session-secret"
SECRET_OWNER_PASS="lectra-owner-password"
SECRET_RESPONDENT_PASS="lectra-respondent-password"



echo "=================================================================="
echo "LECTRA Cloud Run Deployment"
echo "Project : ${PROJECT_ID}"
echo "Region  : ${REGION}"
echo "Demo    : ${SEED_DEMO_DATA}"
echo "Dry Run : ${DRY_RUN}"
echo "=================================================================="

# ==============================================================================
# 1. Enable required GCP APIs
# ==============================================================================
run_cmd gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com \
  --project "$PROJECT_ID"

# ==============================================================================
# 2. Create Artifact Registry repository (idempotent)
#    Stores the container images (deploy.yml pushes one per commit SHA).
# ==============================================================================
if [ "$DRY_RUN" = "1" ]; then
  run_cmd gcloud artifacts repositories describe "$REPO_NAME" --location "$REGION" --project "$PROJECT_ID"
  run_cmd gcloud artifacts repositories create "$REPO_NAME" --repository-format=docker --location "$REGION" --description="LECTRA container repository" --project "$PROJECT_ID"
else
  if ! gcloud artifacts repositories describe "$REPO_NAME" --location "$REGION" --project "$PROJECT_ID" >/dev/null 2>&1; then
    run_cmd gcloud artifacts repositories create "$REPO_NAME" \
      --repository-format=docker \
      --location "$REGION" \
      --description="LECTRA container repository" \
      --project "$PROJECT_ID"
  fi
fi

# ==============================================================================
# 3. Create Cloud SQL for PostgreSQL instance (idempotent, db-f1-micro requires --edition=enterprise on POSTGRES_17)
#    ⭐ IMPORTANT: keep `--edition=enterprise` (lowercase) — required by
#       db-f1-micro and asserted by deploy/tests/test_deploy_stub.sh.
#       Creating the instance takes several minutes and costs money until
#       deploy/teardown.sh is run.
#    CHANGE ME: --database-version / --tier for a different database.
# ==============================================================================
if [ "$DRY_RUN" = "1" ]; then
  run_cmd gcloud sql instances describe "$SQL_INSTANCE" --project "$PROJECT_ID"
  run_cmd gcloud sql instances create "$SQL_INSTANCE" --database-version=POSTGRES_17 --edition=enterprise --tier=db-f1-micro --region="$REGION" --storage-size=10GB --storage-type=SSD --backup-start-time=03:00 --no-storage-auto-increase --project "$PROJECT_ID"
else
  if ! gcloud sql instances describe "$SQL_INSTANCE" --project "$PROJECT_ID" >/dev/null 2>&1; then
    run_cmd gcloud sql instances create "$SQL_INSTANCE" \
      --database-version=POSTGRES_17 \
      --edition=enterprise \
      --tier=db-f1-micro \
      --region="$REGION" \
      --storage-size=10GB \
      --storage-type=SSD \
      --backup-start-time=03:00 --no-storage-auto-increase \
      --project "$PROJECT_ID"
  fi
fi

run_cmd gcloud sql instances patch "$SQL_INSTANCE" --no-storage-auto-increase --project "$PROJECT_ID" --quiet

# ==============================================================================
# 4. Create Database (idempotent)
# ==============================================================================
if [ "$DRY_RUN" = "1" ]; then
  run_cmd gcloud sql databases describe "$DB_NAME" --instance="$SQL_INSTANCE" --project "$PROJECT_ID"
  run_cmd gcloud sql databases create "$DB_NAME" --instance="$SQL_INSTANCE" --project "$PROJECT_ID"
else
  if ! gcloud sql databases describe "$DB_NAME" --instance="$SQL_INSTANCE" --project "$PROJECT_ID" >/dev/null 2>&1; then
    run_cmd gcloud sql databases create "$DB_NAME" --instance="$SQL_INSTANCE" --project "$PROJECT_ID"
  fi
fi

# ==============================================================================
# 5. Create Dedicated Runtime Service Account & IAM bindings (idempotent)
#    The app runs as this account with least privilege. Here it only gets
#    cloudsql.client (connect to the DB); access to individual secrets is
#    granted later, per secret, after they exist.
# ==============================================================================
if [ "$DRY_RUN" = "1" ]; then
  run_cmd gcloud iam service-accounts describe "$SA_EMAIL" --project "$PROJECT_ID"
  run_cmd gcloud iam service-accounts create "$SA_NAME" --display-name="LECTRA Cloud Run Service Account" --project "$PROJECT_ID"
else
  if ! gcloud iam service-accounts describe "$SA_EMAIL" --project "$PROJECT_ID" >/dev/null 2>&1; then
    run_cmd gcloud iam service-accounts create "$SA_NAME" \
      --display-name="LECTRA Cloud Run Service Account" \
      --project "$PROJECT_ID"
  fi
fi

run_cmd gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudsql.client" \
  --condition=None \
  --quiet

# ==============================================================================
# 6. Create DB User & Store DATABASE_URL in Secret Manager (only if secret does not exist yet)
#    ⭐ IMPORTANT: the DB user's password and the password inside DATABASE_URL
#       must be the same value (checked by test_deploy_stub.sh). Never echo it.
#    CHANGE ME: the URL format below is PostgreSQL + Prisma specific
#       (host=/cloudsql/... unix socket, schema=public, connection_limit=3).
# ==============================================================================
if [ "$DRY_RUN" = "1" ]; then
  run_cmd gcloud secrets describe "$SECRET_DB_URL" --project "$PROJECT_ID"
  run_cmd gcloud sql users list --instance="$SQL_INSTANCE" --project "$PROJECT_ID" --format="value(name)"
  run_cmd gcloud sql users create "$DB_USER" --instance="$SQL_INSTANCE" --password="<GENERATED_HEX_PASSWORD>" --project "$PROJECT_ID"
  run_cmd gcloud secrets create "$SECRET_DB_URL" --replication-policy="automatic" --project "$PROJECT_ID"
  run_cmd gcloud secrets versions add "$SECRET_DB_URL" --data-file=- --project "$PROJECT_ID"
else
  if ! gcloud secrets describe "$SECRET_DB_URL" --project "$PROJECT_ID" >/dev/null 2>&1; then
    DB_PASS="$(openssl rand -hex 24)"
    if gcloud sql users list --instance="$SQL_INSTANCE" --project "$PROJECT_ID" --format="value(name)" | grep -qx "$DB_USER"; then
      echo 'Database user exists but its URL secret is missing. Refusing credential rotation; inspect privately before repair.' >&2
      exit 2
    else
      run_cmd gcloud sql users create "$DB_USER" --instance="$SQL_INSTANCE" --password="$DB_PASS" --project "$PROJECT_ID"
    fi
    DB_URL_VALUE="postgresql://${DB_USER}:${DB_PASS}@localhost/${DB_NAME}?host=/cloudsql/${SQL_CONN_NAME}&schema=public&connection_limit=3"
    run_cmd gcloud secrets create "$SECRET_DB_URL" --replication-policy="automatic" --project "$PROJECT_ID"
    printf "%s" "$DB_URL_VALUE" | gcloud secrets versions add "$SECRET_DB_URL" --data-file=- --project "$PROJECT_ID"
  fi
fi

# Stable session key is generated once and reused on subsequent deployments.
ensure_generated_secret() {
  local name="$1" encoding="$2"
  if [ "$DRY_RUN" = 1 ]; then
    run_cmd gcloud secrets describe "$name" --project "$PROJECT_ID"
    run_cmd gcloud secrets create "$name" --replication-policy=automatic --project "$PROJECT_ID"
    run_cmd gcloud secrets versions add "$name" --data-file=- --project "$PROJECT_ID"
  else
    if ! gcloud secrets describe "$name" --project "$PROJECT_ID" >/dev/null 2>&1; then
      local value
      value="$(openssl rand -"$encoding" 48 | tr '+/' '-_' | tr -d '=\n')"
      gcloud secrets create "$name" --replication-policy=automatic --project "$PROJECT_ID"
      printf '%s' "$value" | gcloud secrets versions add "$name" --data-file=- --project "$PROJECT_ID"
      unset value
    fi
    [[ -n "$(gcloud secrets versions list "$name" --filter=state:ENABLED --limit=1 --format='value(name)' --project "$PROJECT_ID")" ]] || {
      echo 'Secret exists without an enabled version; inspect privately before repair.' >&2; exit 2;
    }
  fi
}
ensure_generated_secret "$SECRET_SESSION" base64
JOB_SECRETS="DATABASE_URL=${SECRET_DB_URL}:latest"
JOB_ENV="NODE_ENV=production,TZ=UTC,ALLOW_PRODUCTION_DATABASE=${DB_NAME},ALLOW_CLOUD_SQL_INSTANCE=${SQL_CONN_NAME}"
if [ "$SEED_DEMO_DATA" = true ]; then
  ensure_generated_secret "$SECRET_OWNER_PASS" hex
  ensure_generated_secret "$SECRET_RESPONDENT_PASS" hex
fi
# One runtime identity; only DB/session secrets are needed by the web service.
# A separate bootstrap job uses role passwords explicitly, never on ordinary migration.
for secret in "$SECRET_DB_URL" "$SECRET_SESSION"; do
  run_cmd gcloud secrets add-iam-policy-binding "$secret" --member="serviceAccount:${SA_EMAIL}" \
    --role=roles/secretmanager.secretAccessor --project "$PROJECT_ID" --quiet
done
if [ "$SEED_DEMO_DATA" = true ]; then
  for secret in "$SECRET_OWNER_PASS" "$SECRET_RESPONDENT_PASS"; do
    run_cmd gcloud secrets add-iam-policy-binding "$secret" --member="serviceAccount:${SA_EMAIL}" \
      --role=roles/secretmanager.secretAccessor --project "$PROJECT_ID" --quiet
  done
fi

# ==============================================================================
# 9. Build & Push Unified Container Image via Cloud Build
#    Builds the root Dockerfile (run this script from the repo root).
#    Tag the reviewed main commit, then resolve/pin the immutable digest.
# ==============================================================================
run_cmd gcloud builds submit \
  --tag "$IMAGE_URI" \
  --project "$PROJECT_ID"

if [ "$DRY_RUN" != 1 ]; then
  IMAGE_URI="$(gcloud artifacts docker images describe "$IMAGE_URI" --project "$PROJECT_ID" --format='value(image_summary.fully_qualified_digest)')"
  [[ "$IMAGE_URI" == "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}@sha256:"* && "$IMAGE_URI" =~ @sha256:[0-9a-f]{64}$ ]] || { echo 'Missing immutable image digest.' >&2; exit 2; }
fi

# ==============================================================================
# 10. Forward-only migration, then an explicit optional bootstrap job
#     ⭐ IMPORTANT: if this job fails the script stops BEFORE deploying the
#        service, so a broken migration never reaches users.
#     Later release automation reuses lectra-migrate; bootstrap is never part of it.
# ==============================================================================
run_cmd gcloud run jobs deploy "$MIGRATE_JOB_NAME" \
  --image "$IMAGE_URI" \
  --region "$REGION" \
  --service-account "$SA_EMAIL" \
  --set-cloudsql-instances "$SQL_CONN_NAME" \
  --set-secrets "$JOB_SECRETS" \
  --set-env-vars "$JOB_ENV" \
  --command "sh" \
  --args "-c,npm run db:migrate:production" \
  --tasks 1 --parallelism 1 \
  --max-retries 0 \
  --task-timeout 300s \
  --project "$PROJECT_ID"

if ! run_cmd gcloud run jobs execute "$MIGRATE_JOB_NAME" \
  --region "$REGION" \
  --wait \
  --project "$PROJECT_ID"; then
  printf '%s\n' "ERROR: Cloud Run migration job '${MIGRATE_JOB_NAME}' failed. Aborting service deployment." >&2
  printf '%s\n' "View job logs with:" >&2
  printf '%s\n' "  gcloud logging read \"resource.type=cloud_run_job AND resource.labels.job_name=${MIGRATE_JOB_NAME}\" --project \"${PROJECT_ID}\" --limit 50 --format=\"value(textPayload)\"" >&2
  exit 1
fi

if [ "$SEED_DEMO_DATA" = true ]; then
  run_cmd gcloud run jobs deploy lectra-bootstrap --image "$IMAGE_URI" --region "$REGION" \
    --service-account "$SA_EMAIL" --set-cloudsql-instances "$SQL_CONN_NAME" \
    --set-secrets "DATABASE_URL=${SECRET_DB_URL}:latest,SEED_OWNER_PASSWORD=${SECRET_OWNER_PASS}:latest,SEED_RESPONDENT_PASSWORD=${SECRET_RESPONDENT_PASS}:latest" \
    --set-env-vars "${JOB_ENV},SEED_PRODUCTION_DEMO=${DB_NAME}" --command sh \
    --args '-c,npm run db:seed:production' --tasks 1 --parallelism 1 --max-retries 0 --task-timeout 300s --project "$PROJECT_ID"
  run_cmd gcloud run jobs execute lectra-bootstrap --region "$REGION" --wait --project "$PROJECT_ID"
fi

# ==============================================================================
# 11. Deploy Cloud Run Service
#     The unified root image listens on PORT=3001 supplied by Cloud Run.
#     ⚠️ --allow-unauthenticated makes the service public (needed for the demo).
# ==============================================================================
run_cmd gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE_URI" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --service-account "$SA_EMAIL" \
  --add-cloudsql-instances "$SQL_CONN_NAME" \
  --set-secrets "DATABASE_URL=${SECRET_DB_URL}:latest,SESSION_SECRET=${SECRET_SESSION}:latest" \
  --set-env-vars "NODE_ENV=production,TZ=UTC,APP_ORIGIN=${APP_ORIGIN},TRUST_PROXY=1" \
  --min-instances 0 \
  --max 3 \
  --max-instances 3 \
  --memory 512Mi \
  --cpu 1 \
  --port 3001 \
  --project "$PROJECT_ID"

if [ "$DRY_RUN" = "1" ]; then
  SERVICE_URL="$APP_ORIGIN"
else
  # Use the deterministic URL used for CSRF's exact origin check. The hashed alias is not the login origin.
  SERVICE_URL="$APP_ORIGIN"
  gcloud run services describe "$SERVICE_NAME" --region "$REGION" --project "$PROJECT_ID" --format='value(status.latestReadyRevisionName)'
fi

# ------------------------------------------------------------------------------
# Summary output (URLs; passwords stay in Secret Manager and are not printed)
# ------------------------------------------------------------------------------
printf '\n'
printf '%s\n' "=================================================================="
printf '%s\n' "Deployment Completed!"
printf '%s\n' "Service URL    : ${SERVICE_URL}"
printf '%s\n' "Health Check   : ${SERVICE_URL}/api/health"
printf '%s\n' "Readiness Check: ${SERVICE_URL}/api/ready"
printf '%s\n' "Image: ${IMAGE_URI}"
printf '%s\n' "Source commit: ${SOURCE_SHA}"

if [ "$SEED_DEMO_DATA" = "true" ]; then
  printf '%s\n' "Synthetic accounts: owner.1@example.test and respondent.11@example.test; role passwords in ${SECRET_OWNER_PASS} / ${SECRET_RESPONDENT_PASS}; never print in evidence."
fi
printf '%s\n' "=================================================================="
