import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { Pool } from 'pg';
import { assertTestDatabase } from '../apps/api/src/test-database.js';
import { seedSyntheticDatabase } from './seed-database.js';

async function main() {
  const action = process.argv[2];
  const environment = process.env;
  const testOptions = { testUrl: environment.TEST_DATABASE_URL, developmentUrl: environment.DATABASE_URL, allowName: environment.ALLOW_TEST_DATABASE };
  if (action === 'seed-test') {
    await seedSyntheticDatabase({ ...testOptions, seedName: environment.SEED_SYNTHETIC_DATA,
      ownerPassword: environment.SEED_OWNER_PASSWORD, respondentPassword: environment.SEED_RESPONDENT_PASSWORD });
    console.info('Synthetic fixtures verified/created; existing data and session records were not overwritten.');
    return;
  }
  let connectionString: string;
  let expected: string;
  if (action === 'migrate-test') {
    expected = assertTestDatabase(testOptions);
    connectionString = environment.TEST_DATABASE_URL!;
  } else if (action === 'migrate-dev') {
    // Forward migrations only. No reset or seed operation is reachable through this branch.
    const url = new URL(environment.DATABASE_URL ?? '');
    expected = decodeURIComponent(url.pathname.slice(1));
    if (environment.NODE_ENV !== 'development' || !['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname ||
        !/^[a-z][a-z0-9_]*$/.test(expected) || environment.ALLOW_DATABASE_MIGRATIONS !== expected ||
        [...url.searchParams.keys()].some(k => ['host', 'port'].includes(k.toLowerCase()))) throw new Error('Development migration requires explicit target opt-in.');
    connectionString = environment.DATABASE_URL!;
  } else throw new Error('Unknown database operation.');
  const pool = new Pool({ connectionString, options: '-c timezone=UTC', connectionTimeoutMillis: 3000 });
  try {
    if ((await pool.query<{ name: string }>('SELECT current_database() AS name')).rows[0]?.name !== expected) throw new Error('Unexpected migration database.');
  } finally { await pool.end(); }
  // No shell interpolation; only the selected, checked URL is given to Prisma.
  await promisify(execFile)(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], {
    env: { ...environment, DATABASE_URL: connectionString, PGOPTIONS: '-c timezone=UTC' }
  });
  console.info('Forward migration deployment completed. No reset or seed was performed.');
}

main().catch(() => { console.error('Database operation refused or failed; inspect configuration/migration status without printing secrets. No automatic reset or retry was attempted.'); process.exitCode = 1; });
