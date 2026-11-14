"""Local Docker-only PostgreSQL socket rehearsal; never invokes gcloud.

Creates task-owned containers and a named volume. Stops containers in finally;
retains the volume and ignored private fixture credentials for inspection.
"""
import argparse
import datetime
import hashlib
import json
import os
from pathlib import Path
import platform
import secrets
import subprocess
import time
from urllib.parse import urlencode

parser = argparse.ArgumentParser()
parser.add_argument('--create-local-containers', action='store_true', required=True)
parser.add_argument('--evidence-dir', required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d%H%M%S%f')
name = 'lectra-ep5-socket-' + stamp
out = root / args.evidence_dir
if out.exists():
    raise SystemExit('Choose a fresh evidence directory; historical results are never overwritten.')
out.mkdir(parents=True)
private = root / '.local/episode5-private' / stamp
private.mkdir(parents=True, mode=0o700)
password, owner, respondent, session = [secrets.token_urlsafe(32) for _ in range(4)]
instance = 'lectra-testproj:asia-southeast1:lectra-pg'
socket = '/cloudsql/' + instance
database = 'lectra_ep5_socket'
url = f'postgresql://lectra:{password}@localhost/{database}?' + urlencode({'host': socket, 'schema': 'public', 'connection_limit': '3'})
values = {'NODE_ENV': 'production', 'DATABASE_URL': url, 'ALLOW_PRODUCTION_DATABASE': database,
          'ALLOW_CLOUD_SQL_INSTANCE': instance, 'SEED_PRODUCTION_DEMO': database,
          'SEED_OWNER_PASSWORD': owner, 'SEED_RESPONDENT_PASSWORD': respondent,
          'SESSION_SECRET': session, 'APP_ORIGIN': 'https://lectra.example.test', 'TRUST_PROXY': '1', 'PORT': '3001'}
for filename, env in [('app.env', values), ('postgres.env', {'POSTGRES_DB': database, 'POSTGRES_USER': 'lectra', 'POSTGRES_PASSWORD': password})]:
    p = private / filename
    p.write_text(''.join(k + '=' + v + '\n' for k, v in env.items()))
    p.chmod(0o600)
head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
paths = subprocess.check_output(['git', 'ls-files', '-co', '--exclude-standard'], cwd=root, text=True).splitlines()
hashes = {p: hashlib.sha256((root / p).read_bytes()).hexdigest() for p in sorted(set(paths)) if
          (root / p).is_file() and (p.startswith(('apps/', 'scripts/', 'prisma/', 'deploy/')) or p in ['Dockerfile', 'package-lock.json', 'prisma.config.ts'])}
rows = []
base = os.environ.copy()
# No inherited Docker platform is asserted as independently verified architecture.
image = name + ':local'
volume = name + '-volume'
mount = ['--mount', f'type=volume,src={volume},dst=/cloudsql']

def save():
    (out / 'results.json').write_text(json.dumps({'baseCommit': head, 'environment': {'system': platform.system(), 'machine': platform.machine()},
        'sourceHashes': hashes, 'commands': rows, 'volumeRetained': volume, 'scope': 'Local Docker socket, not GCP or IAM/TLS verification'}, indent=2) + '\n')

def run(label, command):
    r = subprocess.run(command, cwd=root, env=base, capture_output=True, text=True)
    text = r.stdout + r.stderr
    for value in [password, owner, respondent, session]:
        text = text.replace(value, '[REDACTED]')
    text = text.replace(str(private), '<private-local-directory>')
    (out / (label + '.txt')).write_text(text)
    rows.append({'label': label, 'exit': r.returncode})
    save()
    print(label + ': exit ' + str(r.returncode), flush=True)
    if r.returncode:
        raise RuntimeError(label + ' failed; see sanitized evidence')
    return r.stdout

try:
    run('01-build', ['docker', 'build', '-t', image, '.'])
    run('02-volume', ['docker', 'volume', 'create', volume])
    run('03-postgres', ['docker', 'run', '-d', '--name', name + '-db', '--env-file', str(private / 'postgres.env'),
        *mount, 'postgres:17-alpine', 'sh', '-c',
        f'mkdir -p {socket} && chown postgres:postgres {socket} && exec docker-entrypoint.sh postgres -c unix_socket_directories=/var/run/postgresql,{socket}'])
    for attempt in range(60):
        # pg_isready can succeed against initdb's temporary socket server before
        # POSTGRES_DB exists. Wait for the final PID 1 server and a real query.
        r = subprocess.run(['docker', 'exec', name + '-db', 'sh', '-c',
            f'test "$(cat /proc/1/comm)" = postgres && psql -h {socket} -U lectra -d {database} -Atc "SELECT 1"'], capture_output=True)
        if r.returncode == 0:
            break
        time.sleep(1)
    else:
        raise RuntimeError('Isolated socket database did not become ready')
    def app(label, *command):
        return run(label, ['docker', 'run', '--rm', '--env-file', str(private / 'app.env'), *mount, image, *command])
    app('04-migrate', 'npm', 'run', 'db:migrate:production')
    app('05-migrate-again', 'npm', 'run', 'db:migrate:production')
    app('06-seed', 'npm', 'run', 'db:seed:production')
    app('07-seed-again', 'npm', 'run', 'db:seed:production')
    app('08-prisma-adapter', 'node', '--input-type=module', '-e',
        "import assert from 'node:assert/strict';import {createDatabase} from './apps/api/dist/database.js';const db=createDatabase(process.env.DATABASE_URL);try{assert.equal(await db.user.count(),7);console.log('Prisma adapter reads seven synthetic accounts through the selected socket');}finally{await db.$disconnect();}")
    run('09-runtime', ['docker', 'run', '-d', '--name', name + '-app', '--env-file', str(private / 'app.env'), *mount, image])
    run('10-health-login-logout', ['docker', 'exec', name + '-app', 'node', '--input-type=module', '-e', """
import assert from 'node:assert/strict';
const base='http://127.0.0.1:3001', origin=process.env.APP_ORIGIN;
let ready;
for(let i=0;i<30;i++){try{ready=await fetch(base+'/api/ready');if(ready.ok)break;}catch{}await new Promise(r=>setTimeout(r,500));}
assert.equal(ready?.status,200);
assert.equal((await fetch(base+'/api/health')).status,200);
assert.equal((await fetch(base+'/')).status,200);
let r=await fetch(base+'/api/auth/session',{headers:{'X-Forwarded-Proto':'https'}});
assert.equal(r.status,200);let body=await r.json(), cookie=r.headers.getSetCookie()[0].split(';')[0];
r=await fetch(base+'/api/auth/login',{method:'POST',headers:{Origin:origin,'X-Forwarded-Proto':'https',Cookie:cookie,'X-CSRF-Token':body.data.csrfToken,'Content-Type':'application/json'},body:JSON.stringify({email:'owner.1@example.test',password:process.env.SEED_OWNER_PASSWORD})});
assert.equal(r.status,200);body=await r.json();let header=r.headers.getSetCookie()[0];assert.match(header,/Secure/);assert.match(header,/__Host-/);cookie=header.split(';')[0];
assert.equal((await fetch(base+'/api/auth/me',{headers:{Cookie:cookie,'X-Forwarded-Proto':'https'}})).status,200);
r=await fetch(base+'/api/auth/logout',{method:'POST',headers:{Origin:origin,'X-Forwarded-Proto':'https',Cookie:cookie,'X-CSRF-Token':body.data.csrfToken,'Content-Type':'application/json'},body:'{}'});assert.equal(r.status,204);
assert.equal((await fetch(base+'/api/auth/me',{headers:{Cookie:cookie,'X-Forwarded-Proto':'https'}})).status,401);
console.log('Actual socket runtime: ready/health/SPA/login/Secure host cookie/me/logout/rejected me passed. TLS termination simulated locally; not GCP evidence.');
"""])
finally:
    # Only this verifier's generated containers; no cloud calls, no volume deletion.
    for suffix in ['-app', '-db']:
        r = subprocess.run(['docker', 'container', 'inspect', name + suffix], capture_output=True)
        if r.returncode == 0:
            run('cleanup' + suffix, ['docker', 'stop', name + suffix])
    save()
