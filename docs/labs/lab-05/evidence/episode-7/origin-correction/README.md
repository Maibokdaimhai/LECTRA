# Configured origin correction after first automatic release

First automatic main push run: https://github.com/Maibokdaimhai/LECTRA/actions/runs/44793979117 (attempt 1), main SHA `79b1cffbb615562fb6b57fc8cb260373abaf5f15`. Both CI/deploy jobs succeeded, keyless auth and image push succeeded, migration execution `lectra-migrate-xnf5p` succeeded, revision `lectra-00003-8mm` received 100% traffic according to workflow gcloud output, public health/readiness/HTML smoke passed; optional authenticated smoke was genuinely SKIP. Original results remain unchanged.

Image digest from the run summary: `sha256:bf8c261622049a76b73f59aabb9e51632df2e93a5c195ecbf63259fe05f9ba05`.

The run summary exported the hashed status.url alias `https://lectra-fvnnovx37a-as.a.run.app`. Episode 5 configured APP_ORIGIN to the deterministic project-number hostname. The code explicitly compares request Origin with APP_ORIGIN. No live failing login was attempted; this mismatch was established from the retained deployment configuration, source, and actual release log. Public smoke success did not verify login on the summary alias. The fix exports only the service's configured literal APP_ORIGIN, with no status.url fallback and no changes to auth policy or cloud configuration.

`red.txt` is the actual pre-fix run against a format-aware gcloud stub: 9 contract tests, 7 failing subcases. `green.txt` is the subsequent full offline suite: 27 Python tests pass plus 6 deploy/5 release shell scenarios. Only absolute local worktree paths in RED were replaced by [WORKTREE]. All gcloud execution here is stubbed; live cloud deployment was performed only by the user-triggered GitHub workflow. `source-hashes.json` binds the tested correction source. actionlint 1.7.12 also passed (shellcheck integration disabled).

This source correction still needs PR CI/teammate review and user-controlled release. It has not been deployed and does not change the historical first-run result. Cloud Console digest/job/revision screenshots and the visible second-release proof remain pending under Issue #65.
