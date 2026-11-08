import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import { assertTestDatabase } from '../apps/api/src/test-database.js';

try {
  const expectedName = assertTestDatabase({ testUrl: process.env.TEST_DATABASE_URL, developmentUrl: process.env.DATABASE_URL, allowName: process.env.ALLOW_TEST_DATABASE });
  const directory = resolve('.local/prisma-smoke');
  await mkdir(directory, { recursive: true });
  const schemaPath = resolve(directory, 'schema.prisma');
  await writeFile(schemaPath, `generator client {
  provider = "prisma-client"
  output = "./client"
}
datasource db {
  provider = "postgresql"
}
model ToolingProbe {
  id Int @id
}
`);
  await promisify(execFile)(process.execPath, ['node_modules/prisma/build/index.js', 'generate', '--schema', schemaPath]);
  const { PrismaClient } = await import(pathToFileURL(resolve(directory, 'client/client.ts')).href);
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.TEST_DATABASE_URL }) });
  try {
    const rows = await client.$queryRaw`SELECT current_database() AS name`;
    if (rows[0]?.name !== expectedName) throw new Error('Unexpected database');
    console.info('Prisma 7.10.1 generated-client / PostgreSQL adapter compatibility passed; no domain migration applied.');
  } finally { await client.$disconnect(); }
} catch {
  console.error('ORM compatibility check failed; no connection secret is printed.');
  process.exitCode = 1;
}
