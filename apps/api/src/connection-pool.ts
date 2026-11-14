import { Pool } from 'pg';

// pg ignores Prisma's connection_limit URL parameter. Bound every real pool.
// The HTTP pool is shared by sessions/auth and domain routes. A separately
// constructed Prisma adapter is budgeted independently, not another default10.
export function createConnectionPool(connectionString: string, purpose: 'runtime' | 'prisma' | 'operator') {
  return new Pool({ connectionString, max: purpose === 'runtime' ? 3 : 1,
    options: '-c timezone=UTC', connectionTimeoutMillis: 3000 });
}

// The CLI uses its own driver, after the preflight pool has been closed.
export function migrationConnectionString(connectionString: string) {
  const url = new URL(connectionString);
  url.searchParams.set('connection_limit', '1');
  return url.toString();
}

export function assertCloudConnectionCapacity(capacity: unknown) {
  if (typeof capacity !== 'number' || !Number.isInteger(capacity) || capacity < 25) {
    throw new Error('Cloud database capacity must be verified at >=25 connections before deployment.');
  }
}
