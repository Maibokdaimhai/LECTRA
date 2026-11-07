import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
const result = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', ...process.argv.slice(2)], {
  env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: resolve('.local/playwright-browsers') },
  stdio: 'inherit'
});
if (result.error) console.error('Playwright could not start.');
process.exitCode = result.status ?? 1;
