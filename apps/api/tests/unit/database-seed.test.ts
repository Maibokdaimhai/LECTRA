import { expect, it } from 'vitest';
import { seedSyntheticDatabase } from '../../../../scripts/seed-database.js';

const safe = { testUrl: 'postgresql://unused@127.0.0.1:1/lectra_test', developmentUrl: 'postgresql://unused@127.0.0.1:1/lectra_dev', allowName: 'lectra_test' };
it('refuses a development target before constructing a seed pool', async () => {
  await expect(seedSyntheticDatabase({ ...safe, testUrl: safe.developmentUrl })).rejects.toThrow('Unsafe test database configuration');
});
it('retains routing-override rejection before seeding', async () => {
  await expect(seedSyntheticDatabase({ ...safe, testUrl: safe.testUrl + '?%70ort=5432' })).rejects.toThrow('Unsafe test database configuration');
});
it('requires a second explicit synthetic-seed opt-in before connecting', async () => {
  await expect(seedSyntheticDatabase(safe)).rejects.toThrow('SEED_SYNTHETIC_DATA');
});
it('requires private supplied passwords instead of committing default credentials', async () => {
  await expect(seedSyntheticDatabase({ ...safe, seedName: 'lectra_test' })).rejects.toThrow('passwords must be supplied');
});
it('rejects over-limit passwords before database access', async () => {
  await expect(seedSyntheticDatabase({ ...safe, seedName: 'lectra_test', ownerPassword: 'x'.repeat(129), respondentPassword: 'x'.repeat(129) })).rejects.toThrow('passwords must be supplied');
});
