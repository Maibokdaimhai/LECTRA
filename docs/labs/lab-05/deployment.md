# Lab 5 deployment record

## Current scope

Episode 1 account/cost-control verification is recorded in [issue #50](https://github.com/Maibokdaimhai/LECTRA/issues/50#issuecomment-6873522036). Episode 2 code preparation, full configuration inventory, local production-profile checks and operator commands are documented in [cloud readiness](episode-2-cloud-readiness.md) and [issue #51](https://github.com/Maibokdaimhai/LECTRA/issues/51).

## Commands and configuration

- Install: `npm ci` with the pinned Node/npm from README.
- Build: `npm run build`; typecheck: `npm run typecheck`.
- Local production-profile and existing regression matrix: `python3 scripts/verify-lab5-episode2.py --create-local-test-databases` (Docker and installed Chromium required).
- Environment-only production start after build: `npm start`.
- Explicit future production forward migration: `npm run db:migrate:production`.
- Optional explicit future synthetic UAT bootstrap: `npm run db:seed:production`.
- Required environment settings, purposes, example values, secret classification, proxy trust preconditions and separate migration/seed opt-ins: [Episode 2 inventory](episode-2-cloud-readiness.md#environment-inventory).

## Later episode records

No application Docker image, GCP service URL, cloud region/resource inventory, deployed release SHA or CI/CD execution is claimed by Episode 2. Record actual values and evidence here as Episodes 3–8 are performed: image build/run, PR CI and required checks, reviewed cloud resource plan and first deployment, identity federation/merge gate, automatic deployment/smoke, persistent data through restart/redeploy, and rollback. Review commands with the human operator before changing cloud billing, IAM or databases. Keep real secret values out of this file.
