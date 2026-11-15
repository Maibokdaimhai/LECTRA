import { PrismaPg } from '@prisma/adapter-pg';
import { createConnectionPool } from './connection-pool.js';
import { PrismaClient } from './generated/prisma/client.js';

// External pool ownership is explicit so $disconnect closes this bounded pool.
export function createDatabaseAdapter(connectionString: string) {
  return new PrismaPg(createConnectionPool(connectionString, 'prisma'), { disposeExternalPool: true });
}
export function createDatabase(connectionString: string) {
  return new PrismaClient({ adapter: createDatabaseAdapter(connectionString) });
}
