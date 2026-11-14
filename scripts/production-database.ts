import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { Pool } from 'pg';
import { productionTarget } from './production-database-config.js';
import { seedFixtureRows } from './seed-database.js';

export async function productionDatabase(action: string, environment: NodeJS.ProcessEnv) {
  const target = productionTarget(environment, action);
  const pool = new Pool({ connectionString: target.connectionString, options: '-c timezone=UTC', connectionTimeoutMillis: 3000 });
  try {
    if ((await pool.query('SELECT current_database() AS name')).rows[0]?.name !== target.name) throw new Error('Unexpected database.');
  } finally { await pool.end(); }
  if (action === 'migrate') {
    await promisify(execFile)(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], {
      env: { ...environment, DATABASE_URL: target.connectionString, PGOPTIONS: '-c timezone=UTC' }
    });
  } else {
    await seedFixtureRows(target.connectionString, target.name, environment.SEED_OWNER_PASSWORD!, environment.SEED_RESPONDENT_PASSWORD!);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  productionDatabase(process.argv[2] ?? '', process.env).then(() => {
    console.info('Production database operation completed; no reset or automatic startup seed.');
  }).catch(() => {
    console.error('Production database operation refused or failed. Check target, credentials and migration status privately; no automatic retry/reset.');
    process.exitCode = 1;
  });
}
