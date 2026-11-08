import argon2 from 'argon2';
import { expect, it } from 'vitest';
it('loads the native Argon2id package and verifies a synthetic round trip (setup only)', async () => {
  const hash = await argon2.hash('synthetic-local-compatibility-input', { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
  expect(hash).toMatch(/^\$argon2id\$/);
  expect(await argon2.verify(hash, 'synthetic-local-compatibility-input')).toBe(true);
  expect(await argon2.verify(hash, 'different-synthetic-input')).toBe(false);
});
