import { expect, it } from 'vitest';
import { productionTarget } from '../../../../scripts/production-database-config.js';
import { Client } from 'pg';
const valid = { NODE_ENV: 'production', DATABASE_URL: 'postgresql://unused@127.0.0.1/lectra', ALLOW_PRODUCTION_DATABASE: 'lectra' };
it('EP2-S01: requires production mode, a known operation and an exact target opt-in', () => {
  expect(productionTarget(valid, 'migrate').name).toBe('lectra');
  for (const input of [{ ...valid, NODE_ENV: 'test' }, { ...valid, ALLOW_PRODUCTION_DATABASE: 'other' }, { ...valid, DATABASE_URL: 'invalid-private-value' }]) {
    expect(() => productionTarget(input, 'migrate')).toThrow('explicit matching target');
  }
  expect(() => productionTarget(valid, 'reset')).toThrow('explicit matching target');
});
it.each(['host', 'HOST', '%68ost', 'port', '%70ort'])('EP2-S02: refuses hidden database routing %s before connecting', key => {
  expect(() => productionTarget({ ...valid, DATABASE_URL: `${valid.DATABASE_URL}?${key}=other` }, 'migrate')).toThrow('explicit matching target');
});
it('EP2-S03: seed requires separate confirmation and private, distinct role passwords', () => {
  expect(() => productionTarget(valid, 'seed')).toThrow('second explicit');
  const seed = { ...valid, SEED_PRODUCTION_DEMO: 'lectra' };
  expect(() => productionTarget(seed, 'seed')).toThrow('supplied privately');
  expect(() => productionTarget({ ...seed, SEED_OWNER_PASSWORD: 'replace-this-password', SEED_RESPONDENT_PASSWORD: 'private-other-password' }, 'seed')).toThrow('supplied privately');
  expect(() => productionTarget({ ...seed, SEED_OWNER_PASSWORD: 'same-private-password', SEED_RESPONDENT_PASSWORD: 'same-private-password' }, 'seed')).toThrow('different passwords');
});

it('EP5-S01: an explicitly selected Cloud SQL socket resolves consistently for pg and the migration URL', () => {
  const instance = 'lectra-testproj:asia-southeast1:lectra-pg';
  const socket = `/cloudsql/${instance}`;
  const input = { ...valid, ALLOW_CLOUD_SQL_INSTANCE: instance,
    DATABASE_URL: `postgresql://lectra:private-test-value@localhost/lectra?host=${socket}&schema=public&connection_limit=3` };
  const target = productionTarget(input, 'migrate');
  expect(target.connectionString).toBe(input.DATABASE_URL);
  // Inspect the actual pg client's parsed route without opening a network connection.
  const client = new Client({ connectionString: target.connectionString });
  expect(client.host).toBe(socket);
  expect(client.database).toBe('lectra');
});

it.each([
  ['missing opt-in', undefined, 'host=/cloudsql/lectra-testproj:asia-southeast1:lectra-pg'],
  ['different instance', 'lectra-testproj:asia-southeast1:other-pg', 'host=/cloudsql/lectra-testproj:asia-southeast1:lectra-pg'],
  ['duplicate host', 'lectra-testproj:asia-southeast1:lectra-pg', 'host=/cloudsql/lectra-testproj:asia-southeast1:lectra-pg&host=/tmp/other'],
  ['upper-case alias', 'lectra-testproj:asia-southeast1:lectra-pg', 'HOST=/cloudsql/lectra-testproj:asia-southeast1:lectra-pg'],
  ['port override', 'lectra-testproj:asia-southeast1:lectra-pg', 'host=/cloudsql/lectra-testproj:asia-southeast1:lectra-pg&port=1234'],
  ['second routing mechanism', 'lectra-testproj:asia-southeast1:lectra-pg', 'host=/cloudsql/lectra-testproj:asia-southeast1:lectra-pg&service=other'],
  ['different schema', 'lectra-testproj:asia-southeast1:lectra-pg', 'host=/cloudsql/lectra-testproj:asia-southeast1:lectra-pg&schema=other'],
  ['unreviewed connection limit', 'lectra-testproj:asia-southeast1:lectra-pg', 'host=/cloudsql/lectra-testproj:asia-southeast1:lectra-pg&connection_limit=100'],
  ['non-socket target', 'lectra-testproj:asia-southeast1:lectra-pg', 'schema=public'],
])('EP5-S02: refuses %s before connecting', (_label, instance, query) => {
  expect(() => productionTarget({ ...valid, ALLOW_CLOUD_SQL_INSTANCE: instance,
    DATABASE_URL: `${valid.DATABASE_URL.replace('127.0.0.1', 'localhost')}?${query}` }, 'migrate')).toThrow('explicit matching target');
});
