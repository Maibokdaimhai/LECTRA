import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { assertTestDatabase } from '../apps/api/src/test-database.js';
try {
  if(JSON.parse(readFileSync('package.json','utf8')).name!=='lectra')throw Error();
  const expected=assertTestDatabase({testUrl:process.env.TEST_DATABASE_URL,developmentUrl:process.env.DATABASE_URL,allowName:process.env.ALLOW_TEST_DATABASE});
  const paths=['.local/demo-setup.env','.local/demo.env'];
  if(paths.some(existsSync))throw Error();
  mkdirSync('.local',{recursive:true});
  const owner=randomBytes(24).toString('base64url'),student=randomBytes(24).toString('base64url'),secret=randomBytes(32).toString('base64url');
  // URLs are written as JSON strings so Node's env loader cannot reinterpret delimiters.
  const value=(input:string)=>JSON.stringify(input);
  const setup=`NODE_ENV=test\nDATABASE_URL=${value(process.env.DATABASE_URL!)}\nTEST_DATABASE_URL=${value(process.env.TEST_DATABASE_URL!)}\nALLOW_TEST_DATABASE=${expected}\nSEED_SYNTHETIC_DATA=${expected}\nSEED_OWNER_PASSWORD=${owner}\nSEED_RESPONDENT_PASSWORD=${student}\n`;
  const runtime=`NODE_ENV=development\nDATABASE_URL=${value(process.env.TEST_DATABASE_URL!)}\nAPP_ORIGIN=http://127.0.0.1:5173\nSESSION_SECRET=${secret}\nPORT=3001\n`;
  writeFileSync(paths[0]!,setup,{flag:'wx',mode:0o600});writeFileSync(paths[1]!,runtime,{flag:'wx',mode:0o600});
  console.info('Private demo setup/runtime files created (0600). Credentials are only in .local/demo-setup.env; no values printed.');
}catch{console.error('Demo configuration refused. Run from the repository root with distinct opted-in test/development targets; existing demo files are never overwritten.');process.exitCode=1;}
