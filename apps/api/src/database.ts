import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.js';

// Explicit construction only: importing the module opens no application pool.
// Session-store pools must use the same UTC setting and be closed separately by #17.
export function createDatabase(connectionString: string) {
  return new PrismaClient({ adapter: new PrismaPg({
    connectionString, options: '-c timezone=UTC', connectionTimeoutMillis: 3000
  }) });
}
