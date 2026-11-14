"""Local-only Episode 2 verification. Requires Docker, installed npm deps and Chromium.

Creates one dedicated PostgreSQL 17 container and eight NEW disposable databases.
Never connects to GCP, reads .env files, resets a database, or touches other containers.
Generated credentials stay in process memory; committed logs redact their values.
The container is stopped (not deleted) on completion/failure for inspection.
"""
import argparse
import datetime
import hashlib
import json
import os
import pathlib
import re
import secrets
import subprocess
import time

parser = argparse.ArgumentParser()
parser.add_argument('--create-local-test-databases', action='store_true', required=True)
args = parser.parse_args()
repo = pathlib.Path(__file__).resolve().parent.parent
out = repo / 'docs/labs/lab-05/evidence/episode-2'
out.mkdir(parents=True, exist_ok=True)
stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d%H%M%S')
container = 'lectra-lab5-ep2-' + stamp
password, owner, respondent, session = [secrets.token_urlsafe(32) for _ in range(4)]
base = {k: v for k, v in os.environ.items() if not k.startswith(('PG', 'SEED_', 'ALLOW_', 'TEST_DATABASE', 'DATABASE_', 'APP_ORIGIN', 'SESSION_SECRET', 'NODE_ENV', 'TRUST_PROXY', 'PORT', 'RESTART_PASSWORD', 'DEVELOPMENT_DATABASE'))}
base['NO_COLOR'] = '1'
redactions = [password, owner, respondent, session]
results = []

def capture(command, env=None):
    return subprocess.run(command, cwd=repo, env=env or base, capture_output=True, text=True)

def redact(value):
    for secret in redactions:
        value = value.replace(secret, '[REDACTED]')
    return value

def run(label, command, env=None):
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    p = capture(command, env)
    text = redact(p.stdout + p.stderr)
    (out / (label + '.txt')).write_text(text)
    row = {'label': label, 'command': command, 'startedAtUtc': started, 'exit': p.returncode,
           'summary': [line.strip() for line in text.splitlines() if re.search(r'Tests\s|Test Files\s|\d+ passed \(|restart:', line)]}
    results.append(row)
    print(json.dumps(row), flush=True)
    (out / 'results.json').write_text(json.dumps({'baseCommit': base_sha, 'sourceHashes': hashes, 'results': results}, indent=2) + '\n')
    if p.returncode:
        raise RuntimeError('Verification failed: ' + label + '; see sanitized log.')

base_sha = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=repo, text=True).strip()
paths = subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard'], cwd=repo, text=True).splitlines()
hashes = {p: hashlib.sha256((repo / p).read_bytes()).hexdigest() for p in sorted(set(paths))
          if (p.startswith(('apps/', 'scripts/', 'prisma/')) or p in ['package.json', 'package-lock.json', '.env.example', '.env.test.example'] or p.startswith(('vitest.', 'playwright', 'tsconfig', 'prisma.config'))) and (repo / p).is_file()}
created = False
try:
    p = capture(['docker', 'run', '-d', '--name', container, '-e', 'POSTGRES_USER=lectra', '-e', 'POSTGRES_PASSWORD', '-p', '127.0.0.1::5432', 'postgres:17'], {**base, 'POSTGRES_PASSWORD': password})
    if p.returncode:
        raise RuntimeError('Could not create dedicated local test container.')
    created = True
    for _ in range(100):
        if capture(['docker', 'exec', container, 'pg_isready', '-h', '127.0.0.1', '-U', 'lectra']).returncode == 0:
            break
        time.sleep(0.2)
    else:
        raise RuntimeError('PostgreSQL readiness timeout.')
    port = json.loads(capture(['docker', 'inspect', container]).stdout)[0]['NetworkSettings']['Ports']['5432/tcp'][0]['HostPort']
    profiles = {}
    dev = f'postgresql://lectra:{password}@127.0.0.1:{port}/lectra_dev'
    for kind, flag in [('cloud', 'ALLOW_CLOUD_TESTS'), ('features', 'ALLOW_FEATURE_TESTS'), ('release', 'ALLOW_RELEASE_TESTS'),
                       ('foundation', 'ALLOW_FOUNDATION_TESTS'), ('tooling', None), ('browser', 'ALLOW_BROWSER_TESTS'),
                       ('logout', 'ALLOW_BROWSER_TESTS'), ('postrelease', 'ALLOW_POST_RELEASE_TESTS')]:
        name = 'lectra_test_ep2_' + kind
        p = capture(['docker', 'exec', container, 'createdb', '-U', 'lectra', name])
        if p.returncode:
            raise RuntimeError('Could not create new disposable database.')
        url = f'postgresql://lectra:{password}@127.0.0.1:{port}/{name}'
        profiles[kind] = {**base, 'NODE_ENV': 'test', 'DATABASE_URL': dev, 'TEST_DATABASE_URL': url,
                          'DEVELOPMENT_DATABASE_URL': dev, 'ALLOW_TEST_DATABASE': name,
                          'SEED_SYNTHETIC_DATA': name, 'SEED_OWNER_PASSWORD': owner, 'SEED_RESPONDENT_PASSWORD': respondent,
                          'SESSION_SECRET': session, 'APP_ORIGIN': 'http://127.0.0.1:4174', 'RESTART_PASSWORD': owner}
        if flag:
            profiles[kind][flag] = name
        if kind in ('browser', 'logout'):
            profiles[kind]['DATABASE_URL'] = url
    run('01-typecheck', ['npm', 'run', 'typecheck'])
    run('02-build', ['npm', 'run', 'build'])
    run('03-unit', ['npm', 'run', 'test:unit'])
    run('04-api', ['npm', 'run', 'test:api'])
    for number, kind, config in [(5, 'cloud', 'cloud'), (6, 'features', 'features'), (7, 'release', 'release'),
                                  (8, 'foundation', 'foundation'), (9, 'tooling', 'db'), (10, 'postrelease', 'post-release')]:
        run(f'{number:02}-{kind}', ['node', 'node_modules/vitest/vitest.mjs', 'run', '--config', f'vitest.{config}.config.ts'], profiles[kind])
    run('11-orm', ['node', '--import', 'tsx', 'scripts/orm-smoke.ts'], profiles['features'])
    run('12-restart', ['node', '--import', 'tsx', 'scripts/verify-restart.ts'], profiles['features'])
    run('13-ui-recovery', ['npm', 'run', 'test:e2e:recovery'])
    run('14-ui-tooling', ['npm', 'run', 'test:e2e'])
    run('15-ui-domain', ['node', 'scripts/playwright.mjs', 'test', '--config', 'playwright.features.config.ts'], profiles['browser'])
    run('16-ui-logout', ['node', 'scripts/playwright.mjs', 'test', '--config', 'playwright.logout.config.ts'], profiles['logout'])
finally:
    if created:
        capture(['docker', 'stop', container])
        print('Stopped dedicated local test container: ' + container, flush=True)
