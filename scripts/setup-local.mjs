import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
try {
  if (JSON.parse(readFileSync('package.json', 'utf8')).name !== 'lectra') throw new Error();
  const paths = ['.env', '.env.test.local', '.local/postgres.env'];
  if (paths.some(path => existsSync(path))) {
    console.error('Local configuration already exists; no files were overwritten.');
    process.exitCode = 1;
  } else {
    mkdirSync('.local', { recursive: true });
    const password = randomBytes(24).toString('base64url');
    const secret = randomBytes(32).toString('base64url');
    const development = `postgresql://lectra:${password}@127.0.0.1:55432/lectra_dev`;
    const test = `postgresql://lectra:${password}@127.0.0.1:55432/lectra_test`;
    const files = {
      '.local/postgres.env': `POSTGRES_USER=lectra\nPOSTGRES_PASSWORD=${password}\nPOSTGRES_DB=lectra_test\n`,
      '.env': `NODE_ENV=development\nPORT=3001\nAPP_ORIGIN=http://127.0.0.1:5173\nDATABASE_URL=${development}\nSESSION_SECRET=${secret}\n`,
      '.env.test.local': `NODE_ENV=test\nDATABASE_URL=${development}\nTEST_DATABASE_URL=${test}\nALLOW_TEST_DATABASE=lectra_test\n`
    };
    for (const [path, contents] of Object.entries(files)) writeFileSync(path, contents, { mode: 0o600, flag: 'wx' });
    console.info('Ignored local configuration created with synthetic random secrets; values were not printed.');
  }
} catch {
  console.error('Local setup failed. Run from the LECTRA root and inspect existing file permissions.');
  process.exitCode = 1;
}
