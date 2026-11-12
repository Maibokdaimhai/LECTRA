import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
const smoke = process.argv.includes('--smoke');
const features = process.argv.includes('--features');
const apiPort = smoke ? 3101 : features ? 3102 : Number(process.env.PORT ?? 3001);
const webPort = smoke ? 4173 : features ? 4174 : 5173;
const env = {
  ...process.env,
  PORT: String(apiPort),
  API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
  ...(smoke ? {
    NODE_ENV: 'test', APP_ORIGIN: `http://127.0.0.1:${webPort}`,
    DATABASE_URL: 'postgresql://unused@127.0.0.1:1/lectra_smoke',
    SESSION_SECRET: randomBytes(32).toString('base64url')
  } : {})
};
const children = [
  spawn(process.execPath, ['--import', 'tsx', 'apps/api/src/server.ts'], { env, stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'apps/web', '--host', '127.0.0.1', '--port', String(webPort), '--strictPort'], { env, stdio: 'inherit' })
];
let closing = false;
function shutdown(code) {
  if (closing) return;
  closing = true;
  process.exitCode = code;
  for (const child of children) if (child.exitCode === null) child.kill('SIGTERM');
  const timer = setTimeout(() => {
    for (const child of children) if (child.exitCode === null) child.kill('SIGKILL');
  }, 5000);
  timer.unref();
}
for (const child of children) {
  child.on('error', () => { console.error('Workspace service failed to start.'); shutdown(1); });
  child.on('exit', code => { if (!closing) shutdown(code === 0 ? 1 : (code ?? 1)); });
}
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
