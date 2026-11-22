#!/usr/bin/env bash
# ==============================================================================
# LECTRA — release.sh (used by .github/workflows/deploy.yml)
# ==============================================================================
# WHAT THIS SCRIPT DOES
#   Update pre-provisioned resources only. Does not create SQL, IAM or secrets.
#   (Create those once with deploy/deploy.sh.)
#   Normal release : verify image -> run migration job -> update service.
#   Rollback       : verify image -> update service (NO migration, NO seed).
#
# INPUT (environment variables)
#   PROJECT_ID, REGION, IMAGE_TAG   required (IMAGE_TAG = full 40-char commit SHA)
#   SERVICE_NAME, MIGRATE_JOB_NAME  optional (default: lectra, lectra-migrate)
#   ROLLBACK                        true | false (default false)
#   GITHUB_ENV                      when set, SERVICE_URL / DEPLOYED_IMAGE are
#                                   appended so later workflow steps can use them
#
# ⭐ IMPORTANT
#   - If the migration job fails, `set -e` stops the script BEFORE the service is
#     updated, so a broken migration never reaches users.
#   - The image is resolved to an immutable @sha256 digest so the job and the
#     service run exactly the same image.
#   - Offline test: deploy/tests/test_release_stub.sh
#
# REFERENCES
#   - gcloud run jobs update/execute : https://cloud.google.com/sdk/gcloud/reference/run/jobs
#   - gcloud run services update     : https://cloud.google.com/sdk/gcloud/reference/run/services/update
#   - update-traffic (--to-latest)   : https://cloud.google.com/sdk/gcloud/reference/run/services/update-traffic
#   - Artifact Registry images       : https://cloud.google.com/sdk/gcloud/reference/artifacts/docker/images/describe
#
# ⭐ CHANGE ME — groups using another tech stack must review:
#   # CHANGE ME: default SERVICE_NAME / MIGRATE_JOB_NAME and the image path
#   #            `lectra/lectra` (Artifact Registry repo / image name)
#   # CHANGE ME: how the migration is run (the Cloud Run job is created by
#   #            deploy/deploy.sh step 10 — change the command there)
# ==============================================================================
set -euo pipefail

# Live release is allowed only in the reviewed main GitHub deployment workflow.
# Local verification uses marked command stubs; DRY_RUN is not a live bypass.
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/offline_guard.sh"
require_release_execution

# ------------------------------------------------------------------------------
# 1. Read and validate inputs (fail before any GCP call)
# ------------------------------------------------------------------------------
: "${PROJECT_ID:?Required}" "${REGION:?Required}" "${IMAGE_TAG:?Required}"
# CHANGE ME: default resource names.
SERVICE_NAME="${SERVICE_NAME:-lectra}"
MIGRATE_JOB_NAME="${MIGRATE_JOB_NAME:-lectra-migrate}"
ROLLBACK="${ROLLBACK:-false}"
[[ "$PROJECT_ID" =~ ^[a-z][a-z0-9-]{4,28}[a-z0-9]$ ]] || { echo 'Invalid project ID.' >&2; exit 1; }
[[ "$REGION" =~ ^[a-z]+-[a-z]+[0-9]+$ ]] || { echo 'Invalid region.' >&2; exit 1; }
for name in "$SERVICE_NAME" "$MIGRATE_JOB_NAME"; do
  [[ "$name" =~ ^[a-z][a-z0-9-]{0,61}[a-z0-9]$ ]] || { echo 'Invalid resource name.' >&2; exit 1; }
done
[[ "$IMAGE_TAG" =~ ^[0-9a-f]{40}$ ]] || { echo 'Invalid image tag.' >&2; exit 1; }
[[ "$ROLLBACK" == true || "$ROLLBACK" == false ]] || { echo 'Invalid rollback mode.' >&2; exit 1; }

# ------------------------------------------------------------------------------
# 2. Find the image and pin it by digest
#    CHANGE ME: `lectra/lectra` = <Artifact Registry repo>/<image name>.
# ------------------------------------------------------------------------------
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/lectra/lectra:$IMAGE_TAG"
# Resolve to a digest so the job and service run the exact same immutable image.
DIGEST_IMAGE="$(gcloud artifacts docker images describe "$IMAGE" --project="$PROJECT_ID" --format='value(image_summary.fully_qualified_digest)')"
DIGEST_PREFIX="$REGION-docker.pkg.dev/$PROJECT_ID/lectra/lectra@sha256:"
DIGEST_VALUE="${DIGEST_IMAGE#"$DIGEST_PREFIX"}"
[[ "$DIGEST_IMAGE" == "$DIGEST_PREFIX$DIGEST_VALUE" && "$DIGEST_VALUE" =~ ^[0-9a-f]{64}$ ]] || { echo 'Image digest not found.' >&2; exit 1; }

# Read-only preflight: resolve/validate the retained login origin BEFORE any
# migration/job/service/traffic mutation, including rollback. Never use status.url.
# status.url can be a hashed alias, which is not the exact Origin accepted by
# LECTRA login/CSRF. Read the retained APP_ORIGIN without logging the descriptor.
VALIDATED_SERVICE_URL="$(gcloud run services describe "$SERVICE_NAME" --project="$PROJECT_ID" --region="$REGION" --format=json |
  python3 "$(dirname "${BASH_SOURCE[0]}")/service_origin.py")"
[[ "$VALIDATED_SERVICE_URL" =~ ^https://[a-z0-9][a-z0-9.-]*[.]run[.]app$ ]] || { echo 'Invalid service URL.' >&2; exit 1; }

# ------------------------------------------------------------------------------
# 3. Database migration (normal release only; `--wait` blocks until it finishes)
#    ⭐ IMPORTANT: a failure here aborts the release (set -e) — service untouched.
# ------------------------------------------------------------------------------
if [[ "$ROLLBACK" == false ]]; then
  gcloud run jobs update "$MIGRATE_JOB_NAME" --image="$DIGEST_IMAGE" --project="$PROJECT_ID" --region="$REGION" --quiet
  gcloud run jobs execute "$MIGRATE_JOB_NAME" --wait --project="$PROJECT_ID" --region="$REGION" --quiet
else
  echo 'Rollback: reuse existing image; skip tests, build, migration and seed.'
fi

# ------------------------------------------------------------------------------
# 4. Point the Cloud Run service at the image and send it 100% of traffic
# ------------------------------------------------------------------------------
gcloud run services update "$SERVICE_NAME" --image="$DIGEST_IMAGE" --project="$PROJECT_ID" --region="$REGION" --quiet
# Restore 100% traffic to the new latest revision even if it was previously pinned.
gcloud run services update-traffic "$SERVICE_NAME" --to-latest --project="$PROJECT_ID" --region="$REGION" --quiet

# ------------------------------------------------------------------------------
# 5. Report the URL (and hand it to the next workflow steps via GITHUB_ENV)
# ------------------------------------------------------------------------------
SERVICE_URL="$VALIDATED_SERVICE_URL"
echo "Service URL: $SERVICE_URL"
if [[ -n "${GITHUB_ENV:-}" ]]; then
  printf 'SERVICE_URL=%s\nDEPLOYED_IMAGE=%s\n' "$SERVICE_URL" "$DIGEST_IMAGE" >> "$GITHUB_ENV"
fi
