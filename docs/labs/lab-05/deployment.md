# Lab 5 deployment record

## Current scope

Episode 1 account/cost-control verification is recorded in [issue #50](https://github.com/Maibokdaimhai/LECTRA/issues/50#issuecomment-6873522036). Episode 2 code preparation, full configuration inventory, local production-profile checks and operator commands are documented in [cloud readiness](episode-2-cloud-readiness.md) and [issue #51](https://github.com/Maibokdaimhai/LECTRA/issues/51).

Episode 3 Docker packaging is tracked in [issue #53](https://github.com/Maibokdaimhai/LECTRA/issues/53). See [Docker setup, service roles, runtime settings and local persistence evidence](episode-3-docker.md). Local images are built and tested; this does not assert a Cloud Run deployment.

## Supported Episode 2 verification environment

The Python verification runner supports **macOS or Linux, including Linux inside WSL 2**. Run it from a POSIX shell with native tools for that environment. **Native Windows Python, Command Prompt and PowerShell execution of this runner are unsupported**: `npm` is a `.cmd` shim there and the runner intentionally does not launch a Windows command shell. Native Windows support is not an additional instructor requirement.

The completed reproduction recorded for this correction is **macOS 26.6.2 / arm64**, Python 3.14.0, Node 24.22.1 and npm 10.9.2, with local Docker Linux containers and the project's installed Chromium. Exact tool/OS metadata and actual command results are retained in [the macOS reproduction record](evidence/episode-2/reproduction-macos/results.json). This is author-executed verification, not independent reviewer evidence. No successful Linux, WSL or native Windows run is claimed by that record.

Prerequisites on any supported host: Git, Python **3.10+**, pinned Node **24.22.1** and npm **10.9.2**, a running Docker engine for **Linux containers**, installed project dependencies and Chromium/system dependencies. Keep the existing browser ports listed in README available; do not run multiple verification matrices concurrently. `docker version` must report both client and server successfully in the same shell.

### Exact WSL 2 / Ubuntu reproduction steps

On Windows, first install/enable WSL 2 with Ubuntu and enable Docker Desktop's WSL integration for that distribution. If Ubuntu is not installed, run `wsl --install -d Ubuntu` in an administrator PowerShell and finish the requested restart/user setup. These are workstation prerequisites, not cloud-resource changes. Then enter Ubuntu using:

```powershell
wsl -d Ubuntu
```

Run **all remaining commands inside Ubuntu Bash**, not PowerShell. Use the Linux home filesystem and a fresh checkout; do not reuse Windows `node_modules` or Windows `node.exe`/`npm.cmd`/Python. For native Ubuntu/Linux, start at the following commands directly. The binary install block below supports Linux x86_64 and arm64 and uses the official Node distribution:

```bash
sudo apt-get update
sudo apt-get install -y git python3 curl ca-certificates xz-utils
case "$(uname -m)" in
  x86_64) node_arch=x64 ;;
  aarch64|arm64) node_arch=arm64 ;;
  *) echo 'Use a supported Linux x64 or arm64 host'; exit 1 ;;
esac
node_dist="node-v24.22.1-linux-${node_arch}"
node_setup_dir="$(mktemp -d)"
curl --fail --show-error --location "https://nodejs.org/dist/v24.22.1/${node_dist}.tar.xz" --output "${node_setup_dir}/${node_dist}.tar.xz"
mkdir -p "$HOME/.local/share/lectra-node"
tar -xJf "${node_setup_dir}/${node_dist}.tar.xz" -C "$HOME/.local/share/lectra-node"
export PATH="$HOME/.local/share/lectra-node/${node_dist}/bin:$PATH"
npm install --global npm@10.9.2
hash -r
node --version
npm --version
python3 --version
command -v node
command -v npm
docker version
```

Expected Node/npm versions are `v24.22.1` / `10.9.2`; `command -v` must resolve Linux tools, not `/mnt/c/...` Windows executables. Docker Desktop provides the Docker connection through WSL integration; native Linux needs its separately configured Docker engine/user permissions. Resolve a failed `docker version` before continuing. Installing Python 3.10+ may require a supported newer Ubuntu release if the distribution's default is older.

Choose an unused checkout path below (or change the final directory name). If dependencies were installed in an unrelated host environment, use a fresh checkout rather than copying them:

```bash
mkdir -p "$HOME/dev"
git clone --branch refactor/51-cloud-ready https://github.com/Maibokdaimhai/LECTRA.git "$HOME/dev/LECTRA-ep2-review"
cd "$HOME/dev/LECTRA-ep2-review"
git rev-parse HEAD
npm ci
node scripts/playwright.mjs install --with-deps chromium
python3 scripts/verify-lab5-episode2.py --create-local-test-databases
```

The Playwright command installs browser/system prerequisites and may request sudo for Ubuntu packages. The runner prints a new output directory under `.local/lab5-episode2/<timestamp>/`, leaving committed historical evidence untouched. Inspect its `results.json`: all 16 commands must exit 0, the suites must total 239 passed with no failed/skipped tests, and the restart/ORM checks must succeed. Use the checkout's actual revision and source hashes when reporting a new run. If the PR branch is deleted after merge, clone the reviewed staging revision instead and record its SHA.

### macOS reproduction

With the same pinned runtime, Python 3.10+ and Docker Linux containers already configured, run from a fresh checkout or clean working tree:

```bash
node --version
npm --version
python3 --version
docker version
npm ci
npm run browsers:install
python3 scripts/verify-lab5-episode2.py --create-local-test-databases
```

Do not replace committed evidence with your reproduction output. Use `--evidence-dir <new-directory>` only when intentionally retaining a separate review record; the runner refuses a directory containing an existing `results.json`.

## Commands and configuration

- Install: `npm ci` with the pinned Node/npm from README.
- Build: `npm run build`; typecheck: `npm run typecheck`.
- Local production-profile and existing regression matrix: `python3 scripts/verify-lab5-episode2.py --create-local-test-databases` in the supported macOS/Linux environment above (Docker and installed Chromium required; native Windows unsupported).
- Environment-only production start after build: `npm start`.
- Explicit future production forward migration: `npm run db:migrate:production`.
- Optional explicit future synthetic UAT bootstrap: `npm run db:seed:production`.
- Required environment settings, purposes, example values, secret classification, proxy trust preconditions and separate migration/seed opt-ins: [Episode 2 inventory](episode-2-cloud-readiness.md#environment-inventory).

## Later episode records

Episode 3 adds locally verified API/web and unified Docker images, named-volume persistence and packaged browser evidence. Actual image IDs/architecture are recorded in its evidence, not substituted for a deployed release SHA. No GCP service URL, cloud region/resource inventory, deployed release SHA or CI/CD execution is claimed yet. Record actual values as Episodes 4–8 are performed: PR CI/required checks, reviewed cloud resource plan and first deployment, identity federation/merge gate, automatic deployment/smoke, cloud persistence through restart/redeploy, and rollback. Review commands with the human operator before changing cloud billing, IAM or databases. Keep real secret values out of this file.
