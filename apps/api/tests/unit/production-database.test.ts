import { expect, it } from 'vitest';
import { productionTarget } from '../../../../scripts/production-database-config.js';
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
