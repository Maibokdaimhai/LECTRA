import { Pool } from 'pg';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { assertTestDatabase } from '../../src/test-database.js';
let pool: Pool;
let databaseName: string;
beforeAll(async () => {
  databaseName = assertTestDatabase({ testUrl: process.env.TEST_DATABASE_URL, developmentUrl: process.env.DATABASE_URL, allowName: process.env.ALLOW_TEST_DATABASE });
  pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL, options: '-c timezone=UTC', connectionTimeoutMillis: 3000 });
  await pool.query('SELECT 1');
});
afterAll(async () => { await pool?.end(); });
it('connects to the explicitly allowlisted real PostgreSQL 17 test database', async () => {
  const result = await pool.query<{ name: string; timezone: string; version: string }>("SELECT current_database() AS name, current_setting('TimeZone') AS timezone, current_setting('server_version') AS version");
  expect(result.rows[0]?.name).toBe(databaseName);
  expect(result.rows[0]?.timezone).toBe('UTC');
  expect(result.rows[0]?.version).toMatch(/^17\./);
});
it('uses a real isolated transaction and rollback without creating domain schema', async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('CREATE TEMP TABLE lectra_tooling_probe (id integer PRIMARY KEY) ON COMMIT DROP');
    await client.query('INSERT INTO lectra_tooling_probe (id) VALUES ($1)', [1]);
    expect((await client.query('SELECT id FROM lectra_tooling_probe')).rows).toEqual([{ id: 1 }]);
    await client.query('ROLLBACK');
    expect((await client.query("SELECT to_regclass('pg_temp.lectra_tooling_probe') AS name")).rows[0]?.name).toBeNull();
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});
