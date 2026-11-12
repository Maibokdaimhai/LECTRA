import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'node --import tsx scripts/database.ts seed-test' },
  // validate/generate need no running database; operational commands use the guarded wrapper.
  datasource: { url: process.env.DATABASE_URL ?? 'postgresql://unused@127.0.0.1:1/unused' }
});
