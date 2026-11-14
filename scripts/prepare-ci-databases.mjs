import { Pool } from 'pg';
// Fixed loopback target and hardcoded disposable names: never accept a runtime
// DATABASE_URL here or interpolate user-provided SQL identifiers.
const kinds = ['cloud', 'features', 'release', 'foundation', 'tooling', 'browser', 'logout', 'postrelease'];
const names = kinds.map(kind => `lectra_test_ep2_${kind}`);
const port = Number(process.env.CI_POSTGRES_PORT ?? 5432);
if (process.env.ALLOW_CI_DATABASE_SETUP !== 'lectra_ci_control' || process.env.CI_POSTGRES_PASSWORD !== 'lectra_ci_only' ||
    !Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Disposable CI database setup requires explicit fixed control-profile opt-in.');
const pool = new Pool({ host: '127.0.0.1', port, user: 'lectra', password: process.env.CI_POSTGRES_PASSWORD,
  database: 'lectra_ci_control', connectionTimeoutMillis: 3000 });
try {
  if ((await pool.query('SELECT current_database() AS name')).rows[0]?.name !== 'lectra_ci_control') throw new Error('Unexpected CI control database.');
  if ((await pool.query('SELECT datname FROM pg_database WHERE datname = ANY($1::text[])', [names])).rowCount) throw new Error('CI test databases must be new; no reuse/reset is allowed.');
  for (const name of names) await pool.query(`CREATE DATABASE "${name}"`);
  console.info('Eight new disposable CI test databases created; no existing database was reset.');
} finally { await pool.end(); }
