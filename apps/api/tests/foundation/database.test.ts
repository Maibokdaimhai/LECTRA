import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import { isDeepStrictEqual } from 'node:util';
import { Pool } from 'pg';
import argon2 from 'argon2';
import { beforeAll, afterAll, expect, it } from 'vitest';
import { assertTestDatabase } from '../../src/test-database.js';
import { createDatabase } from '../../src/database.js';
import { seedSyntheticDatabase } from '../../../../scripts/seed-database.js';
import { fixtures, fixtureId } from '../../../../prisma/fixtures.js';

let pool: Pool;
const secrets = { ownerPassword: randomBytes(24).toString('base64url'), respondentPassword: randomBytes(24).toString('base64url') };
const options = { testUrl: process.env.TEST_DATABASE_URL, developmentUrl: process.env.DATABASE_URL, allowName: process.env.ALLOW_TEST_DATABASE };
const expected = assertTestDatabase(options);
if (process.env.ALLOW_FOUNDATION_TESTS !== expected) throw new Error('Foundation tests require explicit ALLOW_FOUNDATION_TESTS and a new empty disposable database.');
const command = promisify(execFile);

beforeAll(async () => {
  pool = new Pool({ connectionString: options.testUrl!, options: '-c timezone=UTC', connectionTimeoutMillis: 3000 });
  expect((await pool.query('SELECT current_database() AS name')).rows[0]?.name).toBe(expected);
  expect((await pool.query("SELECT current_setting('server_version') AS version")).rows[0]?.version).toMatch(/^17\./);
  // No resets: refuse existing data/schema and require a new database each suite run.
  expect((await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public'")).rowCount).toBe(0);
});
afterAll(async () => { await pool?.end(); });

it('deploys the actual migration history onto an empty database and deploys again without changes', async () => {
  const env = { ...process.env, DATABASE_URL: options.testUrl!, PGOPTIONS: '-c timezone=UTC' };
  await command(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { env });
  const first = await pool.query('SELECT migration_name, checksum FROM _prisma_migrations ORDER BY migration_name');
  expect(first.rows).toHaveLength(3);
  await command(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { env });
  expect((await pool.query('SELECT migration_name, checksum FROM _prisma_migrations ORDER BY migration_name')).rows).toEqual(first.rows);
});

it('seeds synthetic role/context fixtures twice without changing hashes, IDs or sessions', async () => {
  const seed = { ...options, ...secrets, seedName: expected };
  await seedSyntheticDatabase(seed);
  const first = (await pool.query('SELECT id, "passwordHash" FROM "User" ORDER BY id')).rows;
  expect(first).toHaveLength(7);
  await pool.query("INSERT INTO auth_session VALUES ('foundation-retention','{}',now() AT TIME ZONE 'UTC' + interval '1 hour')");
  await seedSyntheticDatabase(seed);
  expect(isDeepStrictEqual((await pool.query('SELECT id, "passwordHash" FROM "User" ORDER BY id')).rows, first)).toBe(true);
  expect((await pool.query("SELECT count(*)::int AS n FROM auth_session WHERE sid='foundation-retention'")).rows[0]?.n).toBe(1);
  const user = (await pool.query('SELECT "passwordHash" FROM "User" WHERE id=$1', [fixtureId(1)])).rows[0];
  expect(user.passwordHash.startsWith('$argon2id$')).toBe(true);
  expect(await argon2.verify(user.passwordHash, secrets.ownerPassword)).toBe(true);
});

it('refuses a conflicting repeat seed rather than overwriting an edited fixture', async () => {
  await pool.query('UPDATE "User" SET "displayName"=$1 WHERE id=$2', ['Deliberately edited synthetic fixture', fixtureId(1)]);
  await expect(seedSyntheticDatabase({ ...options, ...secrets, seedName: expected })).rejects.toThrow('existing fixture differs');
  expect((await pool.query('SELECT "displayName" FROM "User" WHERE id=$1', [fixtureId(1)])).rows[0]?.displayName).toBe('Deliberately edited synthetic fixture');
  // Restore only the test's own synthetic edit for subsequent storage checks.
  await pool.query('UPDATE "User" SET "displayName"=$1 WHERE id=$2', [fixtures.owners[0]!.displayName, fixtureId(1)]);
});

it('verifies real FK/unique/CHECK constraints, Unicode bounds, reorder and rollback', async () => {
  const client = await pool.connect();
  try { await client.query(await readFile('tests/database/constraints.sql', 'utf8')); }
  finally { await client.query('ROLLBACK'); client.release(); }
  expect((await pool.query('SELECT count(*)::int AS n FROM "User"')).rows[0]?.n).toBe(7);
});

it('generates a typed client that reads native calendar dates and owner relationships', async () => {
  const db = createDatabase(options.testUrl!);
  try {
    const lecture = await db.lecture.findUniqueOrThrow({ where: { id: fixtureId(301) }, include: { section: true } });
    expect(lecture.lectureDate.toISOString().slice(0, 10)).toBe('2026-11-08');
    expect(lecture.section.ownerId).toBe(fixtureId(1));
    expect((await db.section.findUniqueOrThrow({ where: { id: fixtureId(202) } })).ownerId).toBe(fixtureId(2));
  } finally { await db.$disconnect(); }
});

it('retains the mapped session table in a second schema comparison', async () => {
  const result = await command(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'diff', '--from-config-datasource', '--to-schema', 'prisma/schema.prisma', '--exit-code'], { env: { ...process.env, DATABASE_URL: options.testUrl! } });
  expect(result.stderr).not.toContain('DROP TABLE');
  expect((await pool.query("SELECT to_regclass('public.auth_session') AS name")).rows[0]?.name).toBe('auth_session');
});

it('round-trips persistent sessions through connect-pg-simple with UTC and no auto-create', async () => {
  // These CommonJS packages have no declaration packages in the accepted lockfile.
  // This is a runtime compatibility boundary, not an auth/session workflow service.
  const require = createRequire(import.meta.url);
  const Store = require('connect-pg-simple')(require('express-session'));
  const store = new Store({ pool, tableName: 'auth_session', createTableIfMissing: false, pruneSessionInterval: false, disableTouch: true });
    const authenticatedAt = Date.now();
    const authExpiresAt = authenticatedAt + 28800000;
    const payload = { cookie: { expires: new Date(authExpiresAt), originalMaxAge: 28800000, httpOnly: true },
      userId: fixtureId(11), authenticatedAt, authExpiresAt, csrfToken: randomBytes(32).toString('base64url') };
    await new Promise<void>((resolve, reject) => store.set('foundation-store', payload, (error: unknown) => error ? reject(error) : resolve()));
    const read = await new Promise<Record<string, unknown> | null | undefined>((resolve, reject) => store.get('foundation-store', (error: unknown, value: Record<string, unknown> | null | undefined) => error ? reject(error) : resolve(value)));
    expect(read?.userId).toBe(fixtureId(11));
    expect(read?.authExpiresAt).toBe(authExpiresAt);
    expect((await pool.query("SELECT current_setting('TimeZone') AS tz")).rows[0]?.tz).toBe('UTC');
  // No pruning timer; the provided pool belongs to the suite and closes in afterAll.
});

it('enforces participation uniqueness between genuinely overlapping PostgreSQL transactions', async () => {
  await pool.query('INSERT INTO "Survey" (id,"lectureId","ownerId",title,status,"publishedAt") VALUES ($1,$2,$3,$4,\'PUBLISHED\',now())', [fixtureId(402), fixtureId(302), fixtureId(1), 'Concurrent storage fixture']);
  await pool.query('INSERT INTO "Question" (id,"surveyId",position,prompt,type,required,"ratingMin","ratingMax","ratingMinLabel","ratingMaxLabel","scaleInterpretation") VALUES ($1,$2,1,$3,\'RATING\',true,1,5,$4,$5,$6)', [fixtureId(503), fixtureId(402), 'Clarity', 'Not clear', 'Very clear', 'Higher means clearer']);
  await pool.query('INSERT INTO "SurveyEligibility" VALUES ($1,$2)', [fixtureId(402), fixtureId(11)]);
  const a = await pool.connect(); const b = await pool.connect();
  try {
    await a.query('BEGIN'); await b.query('BEGIN');
    await a.query('INSERT INTO "Participation" VALUES ($1,$2)', [fixtureId(402), fixtureId(11)]);
    const pid = (await b.query('SELECT pg_backend_pid() AS pid')).rows[0].pid as number;
    const loser = b.query('INSERT INTO "Participation" VALUES ($1,$2)', [fixtureId(402), fixtureId(11)]).then(() => null, (error: { code: string }) => error);
    let waiting = false;
    const deadline = Date.now() + 3000;
    while (Date.now() < deadline) {
      if ((await pool.query('SELECT wait_event_type FROM pg_stat_activity WHERE pid=$1', [pid])).rows[0]?.wait_event_type === 'Lock') { waiting = true; break; }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    expect(waiting).toBe(true);
    await a.query('INSERT INTO "ResponseBundle" (id,"surveyId","identifiedStudentId") VALUES ($1,$2,$3)', [fixtureId(602), fixtureId(402), fixtureId(11)]);
    await a.query('INSERT INTO "Answer" ("bundleId","questionId","surveyId","ratingValue") VALUES ($1,$2,$3,5)', [fixtureId(602), fixtureId(503), fixtureId(402)]);
    await a.query('COMMIT');
    expect((await loser)?.code).toBe('23505');
    await b.query('ROLLBACK');
    expect((await pool.query('SELECT count(*)::int AS n FROM "Participation" WHERE "surveyId"=$1', [fixtureId(402)])).rows[0]?.n).toBe(1);
  } finally { await a.query('ROLLBACK'); await b.query('ROLLBACK'); a.release(); b.release(); }
});

it('never overwrites submitted associations during a repeat seed', async () => {
  const before = (await pool.query('SELECT to_jsonb(a) AS row FROM "Answer" a WHERE "surveyId"=$1', [fixtureId(402)])).rows;
  expect(before).toHaveLength(1);
  await seedSyntheticDatabase({ ...options, ...secrets, seedName: expected });
  expect((await pool.query('SELECT to_jsonb(a) AS row FROM "Answer" a WHERE "surveyId"=$1', [fixtureId(402)])).rows).toEqual(before);
});
