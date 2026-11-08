import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { Pool } from 'pg';
import { assertTestDatabase } from '../apps/api/src/test-database.js';
const expected = assertTestDatabase({ testUrl: process.env.TEST_DATABASE_URL, developmentUrl: process.env.DATABASE_URL, allowName: process.env.ALLOW_TEST_DATABASE });
if (process.env.ALLOW_FEATURE_TESTS !== expected)
    throw new Error('Restart check requires opted-in feature test storage.');
const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
const origin = 'http://127.0.0.1:5173', url = 'http://127.0.0.1:3105';
const secret = randomBytes(32).toString('base64url');
let child: ReturnType<typeof spawn> | undefined;
async function start() {
    child = spawn(process.execPath, ['apps/api/dist/server.js'], { env: { ...process.env, NODE_ENV: 'test', PORT: '3105', APP_ORIGIN: origin, DATABASE_URL: process.env.TEST_DATABASE_URL!, SESSION_SECRET: secret }, stdio: 'ignore' });
    for (let i = 0; i < 60; i++) {
        if (child.exitCode !== null)
            throw Error('Restart verification service could not start.');
        try {
            if ((await fetch(url + '/api/health')).ok)
                return;
        }
        catch { }
        await new Promise(r => setTimeout(r, 50));
    }
    throw Error('Restart verification readiness timed out.');
}
async function stop() { if (!child || child.exitCode !== null)
    return; const processToStop = child; await new Promise<void>((resolve, reject) => { const timer = setTimeout(() => { processToStop.kill('SIGKILL'); reject(Error('Restart verification shutdown timed out.')); }, 6000); processToStop.once('exit', code => { clearTimeout(timer); code === 0 ? resolve() : reject(Error('Restart verification shutdown failed.')); }); processToStop.kill('SIGTERM'); }); }
async function read(path: string, cookie?: string) { const response = await fetch(url + path, { headers: cookie ? { Cookie: cookie } : {} }); if (!response.ok)
    throw Error('Persistent readback failed.'); return { response, data: (await response.json()).data }; }
async function login(email: string, password: string) { const boot = await read('/api/auth/session'); const guest = boot.response.headers.getSetCookie()[0]!.split(';')[0]!; const response = await fetch(url + '/api/auth/login', { method: 'POST', headers: { Origin: origin, Cookie: guest, 'Content-Type': 'application/json', 'X-CSRF-Token': boot.data.csrfToken }, body: JSON.stringify({ email, password }) }); if (!response.ok)
    throw Error('Restart fixture login failed.'); return response.headers.getSetCookie()[0]!.split(';')[0]!; }
try {
    // Feature tests create a durable submitted/Closed fixture. No reset/reseed here.
    const row = (await pool.query('SELECT id FROM "Survey" WHERE title=\'Clear lecture feedback\' AND status=\'CLOSED\'')).rows[0];
    if (!row)
        throw Error('Run the feature suite first.');
    // Supply the same private seed password used by that feature run via the environment.
    if (!process.env.RESTART_PASSWORD)
        throw Error('Private restart credential is required.');
    await start();
    const owner = await login('owner.1@example.test', process.env.RESTART_PASSWORD), student = await login('respondent.11@example.test', process.env.RESTART_PASSWORD);
    const paths = [{ path: '/api/auth/me', cookie: owner }, { path: `/api/surveys/${row.id}`, cookie: owner }, { path: `/api/surveys/${row.id}/my-submission`, cookie: student }, { path: `/api/surveys/${row.id}/results`, cookie: owner }];
    const before = await Promise.all(paths.map(async (p) => (await read(p.path, p.cookie)).data));
    await stop();
    await start();
    const after = await Promise.all(paths.map(async (p) => (await read(p.path, p.cookie)).data));
    if (JSON.stringify(before) !== JSON.stringify(after))
        throw Error('Restart changed saved identity, deadline or feedback.');
    console.info('Built API process restart: same persisted sessions, absolute deadline, survey, own answers and results verified; no migration or reseed between starts.');
}
finally {
    await stop();
    await pool.end();
}
