import { beforeAll, afterAll, expect, it } from 'vitest';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { networkInterfaces } from 'node:os';
import { Pool } from 'pg';
import request from 'supertest';
import { assertTestDatabase } from '../../src/test-database.js';
import { readConfig } from '../../src/config.js';
import { createApp } from '../../src/app.js';
import { productionDatabase } from '../../../../scripts/production-database.js';
import { fixtureId } from '../../../../prisma/fixtures.js';

const options = { testUrl: process.env.TEST_DATABASE_URL, developmentUrl: process.env.DATABASE_URL, allowName: process.env.ALLOW_TEST_DATABASE };
const expected = assertTestDatabase(options);
if (process.env.ALLOW_CLOUD_TESTS !== expected) throw new Error('Cloud tests require a new empty explicitly opted-in disposable database.');
const password = randomBytes(24).toString('base64url');
const secret = randomBytes(32).toString('base64url');
const env = { ...process.env, NODE_ENV: 'production', DATABASE_URL: options.testUrl!, ALLOW_PRODUCTION_DATABASE: expected,
  SEED_PRODUCTION_DEMO: expected, SEED_OWNER_PASSWORD: password, SEED_RESPONDENT_PASSWORD: randomBytes(24).toString('base64url') };
const pool = new Pool({ connectionString: options.testUrl });
const origin = 'https://lectra.example.test';
const config = (trust = '1', database = options.testUrl!) => readConfig({ NODE_ENV: 'production', DATABASE_URL: database,
  APP_ORIGIN: origin, SESSION_SECRET: secret, TRUST_PROXY: trust });
beforeAll(async () => {
  expect((await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public'")).rowCount).toBe(0);
  await productionDatabase('migrate', env);
  await productionDatabase('seed', env);
});
afterAll(async () => { await pool.end(); });

it('EP2-S04: production migrate/seed reruns and concurrent seeds preserve hashes and unrelated data', async () => {
  const before = (await pool.query('SELECT id,"passwordHash" FROM "User" ORDER BY id')).rows;
  expect(before).toHaveLength(7);
  await pool.query("INSERT INTO auth_session (sid,sess,expire) VALUES ('ep2-preserve','{}',now()+interval '1 hour')");
  await pool.query('INSERT INTO "Course" (code,title) VALUES ($1,$2)', ['EP2-PRESERVE', 'Unrelated live data sentinel']);
  const migrations = (await pool.query('SELECT migration_name,checksum FROM _prisma_migrations ORDER BY migration_name')).rows;
  await productionDatabase('migrate', env);
  await Promise.all([productionDatabase('seed', env), productionDatabase('seed', env)]);
  expect((await pool.query('SELECT id,"passwordHash" FROM "User" ORDER BY id')).rows).toEqual(before);
  expect((await pool.query("SELECT sid FROM auth_session WHERE sid='ep2-preserve'")).rowCount).toBe(1);
  expect((await pool.query('SELECT code FROM "Course" WHERE code=$1', ['EP2-PRESERVE'])).rowCount).toBe(1);
  expect((await pool.query('SELECT migration_name,checksum FROM _prisma_migrations ORDER BY migration_name')).rows).toEqual(migrations);
});

it('EP2-S05: conflicting seed rolls back without overwriting edited fixtures or credentials', async () => {
  await pool.query('UPDATE "User" SET "displayName"=$1 WHERE id=$2', ['Edited live sentinel', fixtureId(1)]);
  const before = (await pool.query('SELECT to_jsonb(u) AS row FROM "User" u ORDER BY id')).rows;
  await expect(productionDatabase('seed', env)).rejects.toThrow('existing fixture differs');
  expect((await pool.query('SELECT to_jsonb(u) AS row FROM "User" u ORDER BY id')).rows).toEqual(before);
  await pool.query('UPDATE "User" SET "displayName"=$1 WHERE id=$2', ['Synthetic Owner 1', fixtureId(1)]);
  const hashes = (await pool.query('SELECT "passwordHash" FROM "User" ORDER BY id')).rows;
  await expect(productionDatabase('seed', { ...env, SEED_OWNER_PASSWORD: randomBytes(24).toString('base64url') })).rejects.toThrow('password differs');
  expect((await pool.query('SELECT "passwordHash" FROM "User" ORDER BY id')).rows).toEqual(hashes);
});

it('EP2-R02: real PostgreSQL readiness ignores stale cookies and never creates sessions', async () => {
  const app = createApp(config());
  try {
    const before = (await pool.query('SELECT count(*)::int AS n FROM auth_session')).rows[0].n;
    const res = await request(app).get('/api/ready').set('Cookie', '__Host-lectra.sid=stale');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { status: 'ready', db: 'connected' } });
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers['set-cookie']).toBeUndefined();
    expect((await pool.query('SELECT count(*)::int AS n FROM auth_session')).rows[0].n).toBe(before);
  } finally { await app.locals.close(); }
});

it('EP2-R03: refused database connection returns safe 503 while liveness remains 200', async () => {
  const url = new URL(options.testUrl!); url.port = '1';
  const app = createApp(config('none', url.href));
  try {
    const res = await request(app).get('/api/ready');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ data: { status: 'not_ready' } });
    expect(res.headers['set-cookie']).toBeUndefined();
    expect(res.headers['cache-control']).toBe('no-store');
    expect((await request(app).get('/api/health')).status).toBe(200);
  } finally { await app.locals.close(); }
});

it('EP2-R04: built production process uses supplied PORT and accepts a non-loopback connection', async () => {
  const probe = createServer();
  await new Promise<void>(resolve => probe.listen(0, '0.0.0.0', resolve));
  const port = (probe.address() as { port: number }).port;
  await new Promise<void>(resolve => probe.close(() => resolve()));
  const address = Object.values(networkInterfaces()).flat().find(n => n?.family === 'IPv4' && !n.internal)?.address;
  expect(address, 'A non-loopback interface is required to verify container reachability').toBeTruthy();
  const child = spawn(process.execPath, ['apps/api/dist/server.js'], { env: {
    ...process.env, NODE_ENV: 'production', DATABASE_URL: options.testUrl!, APP_ORIGIN: origin,
    SESSION_SECRET: secret, TRUST_PROXY: 'none', PORT: String(port)
  }, stdio: 'ignore' });
  try {
    let listening = false;
    for (let i = 0; i < 80; i++) {
      if (child.exitCode !== null) throw new Error('Built production process exited before readiness.');
      try {
        const res = await fetch(`http://${address}:${port}/api/ready`, { signal: AbortSignal.timeout(500) });
        if (res.ok) { expect(await res.json()).toEqual({ data: { status: 'ready', db: 'connected' } }); listening = true; break; }
      } catch { /* allow process startup */ }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    expect(listening).toBe(true);
  } finally {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = new Promise<number | null>(resolve => child.once('exit', resolve));
      const deadline = setTimeout(() => child.kill('SIGKILL'), 7000);
      child.kill('SIGTERM');
      try { expect(await exited).toBe(0); } finally { clearTimeout(deadline); }
    }
  }
});

it('EP2-A01: default proxy trust ignores forged HTTPS headers when issuing secure cookies', async () => {
  const app = createApp(config('none'));
  try {
    const res = await request(app).get('/api/auth/session').set('X-Forwarded-Proto', 'https');
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeUndefined();
    expect(app.get('trust proxy')).toBe(false);
  } finally { await app.locals.close(); }
});

it('EP2-A02: explicit one-hop HTTPS issues secure cookies, preserves auth through app recreation, and enforces CSRF/logout', async () => {
  let app = createApp(config());
  try {
    const boot = await request(app).get('/api/auth/session').set('X-Forwarded-Proto', 'https').expect(200);
    const guest = (boot.headers['set-cookie'] as unknown as string[])[0]!;
    expect(guest).toMatch(/^__Host-lectra.sid=/);
    expect(guest).toContain('HttpOnly'); expect(guest).toContain('Secure'); expect(guest).toContain('SameSite=Lax'); expect(guest).toContain('Path=/');
    expect(guest).not.toContain('Domain=');
    const logged = await request(app).post('/api/auth/login').set('X-Forwarded-Proto', 'https').set('Origin', origin)
      .set('Cookie', guest.split(';')[0]!).set('X-CSRF-Token', boot.body.data.csrfToken).send({ email: 'owner.1@example.test', password }).expect(200);
    const cookie = (logged.headers['set-cookie'] as unknown as string[])[0]!.split(';')[0]!;
    expect(cookie).not.toBe(guest.split(';')[0]);
    expect((await pool.query('SELECT sess FROM auth_session WHERE sess->>\'userId\'=$1', [fixtureId(1)])).rowCount).toBe(1);
    await app.locals.close(); app = createApp(config());
    const me = await request(app).get('/api/auth/me').set('X-Forwarded-Proto', 'https').set('Cookie', cookie).expect(200);
    expect(me.body.data.user.id).toBe(fixtureId(1));
    await request(app).get('/api/auth/me').set('X-Requester-Id', fixtureId(1)).set('X-Role', 'OWNER').expect(401);
    const foreign = await request(app).post('/api/auth/logout').set('X-Forwarded-Proto', 'https').set('Cookie', cookie)
      .set('Origin', 'https://foreign.example.test').set('X-CSRF-Token', logged.body.data.csrfToken).send({}).expect(403);
    expect(foreign.body.error.code).toBe('ORIGIN_FORBIDDEN');
    await request(app).post('/api/auth/logout').set('X-Forwarded-Proto', 'https').set('Cookie', cookie).set('Origin', origin).send({}).expect(403);
    await request(app).post('/api/auth/logout').set('X-Forwarded-Proto', 'https').set('Cookie', cookie).set('Origin', origin)
      .set('X-CSRF-Token', logged.body.data.csrfToken).send({}).expect(204);
    await request(app).get('/api/auth/me').set('X-Forwarded-Proto', 'https').set('Cookie', cookie).expect(401);
  } finally { await app.locals.close(); }
});
