import { expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import { readConfig } from '../../src/config.js';
import { createDatabaseAdapter } from '../../src/database.js';
import { createConnectionPool, migrationConnectionString, assertCloudConnectionCapacity } from '../../src/connection-pool.js';
const url = 'postgresql://unused@127.0.0.1/lectra?connection_limit=3';

it('R60-P01: actual HTTP auth/session/domain pool has max3, independent of driver URL limit', async () => {
  const app = createApp(readConfig({ NODE_ENV: 'test', APP_ORIGIN: 'https://lectra.example.test', DATABASE_URL: url,
    SESSION_SECRET: Buffer.alloc(32, 7).toString('base64url') }));
  try { expect(app.locals.auth.pool.options.max).toBe(3); }
  finally { await app.locals.close(); }
});
it('R60-P02: Prisma adapter actually receives its bounded max1 pool and owns cleanup', async () => {
  const adapter = await createDatabaseAdapter(url).connect();
  try { expect(adapter.underlyingDriver().options.max).toBe(1); }
  finally { await adapter.dispose(); }
});
it('R60-P03: operator preflight and seed pools are bounded to one and never inferred from URL', async () => {
  const pool = createConnectionPool(url + '&max=100', 'operator');
  try { expect(pool.options.max).toBe(1); expect(pool.options.options).toBe('-c timezone=UTC'); }
  finally { await pool.end(); }
});
it('R60-P04: migration CLI keeps the exact target/socket but gets its own effective one-connection limit', () => {
  const input = 'postgresql://u:p@localhost/lectra?host=/cloudsql/lectra-testproj:asia-southeast1:lectra-pg&schema=public&connection_limit=3';
  const result = new URL(migrationConnectionString(input));
  expect(result.searchParams.get('connection_limit')).toBe('1');
  expect(result.searchParams.get('host')).toBe(new URL(input).searchParams.get('host'));
  expect(result.pathname).toBe('/lectra'); expect(result.username).toBe('u');
  expect(new URL(input).searchParams.get('connection_limit')).toBe('3');
});
it('R60-P05: Cloud SQL deployment refuses undersized/unreadable capacity instead of assuming the instance limit', () => {
  for (const capacity of [undefined, 0, 24, NaN]) expect(() => assertCloudConnectionCapacity(capacity)).toThrow('capacity');
  expect(() => assertCloudConnectionCapacity(25)).not.toThrow();
  expect(() => assertCloudConnectionCapacity(100)).not.toThrow();
});
