import { Pool } from 'pg';
import { execFileSync } from 'node:child_process';
import { assertTestDatabase } from '../apps/api/src/test-database.js';
import { seedSyntheticDatabase } from './seed-database.js';
export default async function prepare() {
  const expected=assertTestDatabase({testUrl:process.env.TEST_DATABASE_URL,developmentUrl:process.env.DEVELOPMENT_DATABASE_URL,allowName:process.env.ALLOW_TEST_DATABASE});
  if(process.env.ALLOW_BROWSER_TESTS!==expected || process.env.DATABASE_URL!==process.env.TEST_DATABASE_URL)throw new Error('Browser tests require a new opted-in test database and aligned server configuration.');
  const pool=new Pool({connectionString:process.env.TEST_DATABASE_URL});
  try {if((await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public'")).rowCount)throw new Error('Browser database must be new and empty; no reset is performed.');}finally{await pool.end();}
  execFileSync(process.execPath,['node_modules/prisma/build/index.js','migrate','deploy'],{env:process.env,stdio:'pipe'});
  await seedSyntheticDatabase({testUrl:process.env.TEST_DATABASE_URL,developmentUrl:process.env.DEVELOPMENT_DATABASE_URL,allowName:expected,seedName:expected,ownerPassword:process.env.SEED_OWNER_PASSWORD,respondentPassword:process.env.SEED_RESPONDENT_PASSWORD});
}
