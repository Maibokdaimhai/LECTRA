import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
const token = () => randomBytes(32).toString('base64url');
try {
  mkdirSync('.local', { recursive: true });
  const webPort = 5173;
  writeFileSync('.local/docker.env', `POSTGRES_PASSWORD=${token()}\nSESSION_SECRET=${token()}\nSEED_OWNER_PASSWORD=${token()}\nSEED_RESPONDENT_PASSWORD=${token()}\nWEB_PORT=${webPort}\nAPI_PORT=3001\nAPP_ORIGIN=http://127.0.0.1:${webPort}\n`, { flag: 'wx', mode: 0o600 });
  console.info('Created ignored .local/docker.env with private random local credentials. No secret values printed. Existing files are never overwritten.');
} catch {
  console.error('Docker setup refused/failed. Run from the repository root and check whether .local/docker.env already exists; do not delete existing configuration to force a reset.');
  process.exitCode = 1;
}
