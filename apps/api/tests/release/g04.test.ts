import { beforeAll, afterAll, beforeEach, afterEach, it, expect, vi } from 'vitest';
import request from 'supertest';
import { Pool, type PoolClient } from 'pg';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import type { Express } from 'express';
import { createApp } from '../../src/app.js';
import { readConfig } from '../../src/config.js';
import { assertTestDatabase } from '../../src/test-database.js';
import { seedSyntheticDatabase } from '../../../../scripts/seed-database.js';
import { fixtureId } from '../../../../prisma/fixtures.js';
import { acknowledgementProxy } from './acknowledgement-proxy.js';

const options = { testUrl: process.env.TEST_DATABASE_URL, developmentUrl: process.env.DATABASE_URL, allowName: process.env.ALLOW_TEST_DATABASE };
const expected = assertTestDatabase(options);
if (process.env.ALLOW_RELEASE_TESTS !== expected) throw new Error('Release checks require explicit ALLOW_RELEASE_TESTS and a new empty disposable database.');
const pool = new Pool({ connectionString: options.testUrl, options: '-c timezone=UTC', connectionTimeoutMillis: 3000 });
const origin = 'http://127.0.0.1:5173', password = randomBytes(24).toString('base64url'), secret = randomBytes(32).toString('base64url');
const marker = 'G04_PRIVATE_FAILURE_MARKER';
let app: Express, proxy: Awaited<ReturnType<typeof acknowledgementProxy>>, sequence = 30000;
let uncaught: Error[] = [];
const observeUncaught = (error: Error) => { uncaught.push(error); };
beforeAll(async () => {
    expect((await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public'")).rowCount).toBe(0);
    execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { env: { ...process.env, DATABASE_URL: options.testUrl }, stdio: 'pipe' });
    await seedSyntheticDatabase({ ...options, seedName: expected, ownerPassword: password, respondentPassword: password });
});
beforeEach(async () => {
    uncaught = []; process.on('uncaughtExceptionMonitor', observeUncaught);
    proxy = await acknowledgementProxy(new URL(options.testUrl!));
    app = createApp(readConfig({ NODE_ENV: 'test', APP_ORIGIN: origin, DATABASE_URL: proxy.url, SESSION_SECRET: secret }));
});
afterEach(async () => { vi.restoreAllMocks(); try { await app?.locals.close(); await proxy?.close(); } finally { process.off('uncaughtExceptionMonitor', observeUncaught); } });
afterAll(async () => { await pool.end(); });
async function login(email = 'owner.1@example.test') {
    const agent = request.agent(app), boot = await agent.get('/api/auth/session').expect(200);
    const logged = await agent.post('/api/auth/login').set('Origin', origin).set('X-CSRF-Token', boot.body.data.csrfToken).send({ email, password }).expect(200);
    return { agent, token: logged.body.data.csrfToken as string, logged };
}
type Client = Awaited<ReturnType<typeof login>>;
const mutate = (client: Client, method: 'post' | 'patch', path: string, body: object) => client.agent[method](path).set('Origin', origin).set('X-CSRF-Token', client.token).send(body);
async function lecture() { return (await pool.query('INSERT INTO "Lecture" ("sectionId",title,"lectureDate",sequence) VALUES ($1,\'Release check\',\'2026-11-12\',$2) RETURNING id', [fixtureId(201), ++sequence])).rows[0].id as string; }
const questionnaire = [{ id: null, prompt: 'Clarity', type: 'RATING', required: true, ratingScale: { min: 1, max: 5, minLabel: 'Low', maxLabel: 'High', interpretation: 'Higher means clearer' } }];
async function draft(owner: Client) {
    const d = (await mutate(owner, 'post', '/api/surveys', { lectureId: await lecture() }).expect(201)).body.data;
    return (await mutate(owner, 'patch', `/api/surveys/${d.id}`, { expectedRevision: 1, title: 'Release check', questions: questionnaire }).expect(200)).body.data;
}
async function published(owner: Client) { const d = await draft(owner); return (await mutate(owner, 'post', `/api/surveys/${d.id}/publish`, { expectedRevision: d.definitionRevision }).expect(200)).body.data; }
const wire = (d: any) => ({ expectedRevision: d.definitionRevision, title: d.title, questions: d.questions.map(({ id, prompt, type, required, ratingScale }: any) => ({ id, prompt, type, required, ratingScale })) });
const payload = (d: any) => ({ answers: [{ questionId: d.questions[0].id, value: 4 }] });
async function rows(id: string) { return (await pool.query('SELECT (SELECT count(*)::int FROM "Participation" WHERE "surveyId"=$1) AS participation,(SELECT count(*)::int FROM "ResponseBundle" WHERE "surveyId"=$1) AS bundles,(SELECT count(*)::int FROM "Answer" WHERE "surveyId"=$1) AS answers', [id])).rows[0]; }
function safe(response: request.Response, status: number, code: string) {
    expect(response.status).toBe(status); expect(response.body).toEqual({ error: { code, message: 'Request could not be completed.' } });
    expect(response.headers['cache-control']).toContain('no-store'); expect(JSON.stringify(response.body)).not.toContain(marker);
}
function barrier() { let release!: () => void; const promise = new Promise<void>(resolve => { release = resolve; }); return { promise, release }; }
async function bounded(promise: Promise<unknown>) { let timer: ReturnType<typeof setTimeout> | undefined; try { await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Release-test barrier not reached.')), 5000); })]); } finally { clearTimeout(timer); } }
// Test-only seam runs additional REAL SQL in the route's actual transaction, never fabricates results.
function instrument(action: (client: PoolClient, sql: string, result: any) => Promise<void>) {
    const applicationPool = app.locals.auth.pool as Pool;
    const originals = new Map<PoolClient, PoolClient['query']>();
    const wrap = (client: PoolClient) => {
        if (originals.has(client)) return;
        const original = client.query; originals.set(client, original);
        client.query = ((...args: any[]) => {
            const result = (original as any).apply(client, args);
            return result && typeof result.then === 'function' ? result.then(async (value: any) => { await action(client, String(args[0]), value); return value; }) : result;
        }) as PoolClient['query'];
    };
    applicationPool.on('connect', wrap);
    for (const client of (applicationPool as any)._clients as PoolClient[]) wrap(client);
    return () => { applicationPool.off('connect', wrap); for (const [client, original] of originals) client.query = original; };
}

it('G04-F01: physical loss of authenticated UPSERT acknowledgement suppresses cookie and automatic resave', async () => {
    const agent = request.agent(app), boot = await agent.get('/api/auth/session').expect(200);
    const oldCookie = String(boot.headers['set-cookie']![0]).split(';')[0]!;
    const before = (await pool.query("SELECT count(*)::int AS n FROM auth_session WHERE sess->>'userId' IS NOT NULL")).rows[0].n;
    proxy.arm('auth-save');
    const failed = await agent.post('/api/auth/login').set('Origin', origin).set('X-CSRF-Token', boot.body.data.csrfToken).send({ email: 'owner.1@example.test', password });
    safe(failed, 503, 'AUTH_SERVICE_UNAVAILABLE');
    expect(proxy.dropped()).toMatchObject({ operation: 'auth-save', commandTag: 'INSERT 0 1', backendTransactionStatus: 'I' });
    const cookies = (failed.headers['set-cookie'] ?? []) as unknown as string[];
    expect(cookies.every(cookie => /^lectra\.sid=;/.test(cookie))).toBe(true);
    // The complete row really committed; no new SID reached the client. It is not a partial row.
    expect((await pool.query("SELECT count(*)::int AS n FROM auth_session WHERE sess->>'userId' IS NOT NULL")).rows[0].n).toBe(before + 1);
    await agent.get('/api/auth/me').expect(401);
    await request(app).get('/api/auth/me').set('Cookie', oldCookie).expect(401);
    for (const cookie of cookies) await request(app).get('/api/auth/me').set('Cookie', cookie.split(';')[0]!).expect(401);
    expect((await pool.query("SELECT count(*)::int AS n FROM auth_session WHERE sess->>'userId' IS NOT NULL")).rows[0].n).toBe(before + 1);
    await (await login()).agent.get('/api/auth/me').expect(200);
});

it('G04-F02: create failure after actual Survey insertion rolls back and permits same-Lecture creation', async () => {
    const owner = await login(), id = await lecture();
    await pool.query(`CREATE FUNCTION g04_create_fault() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW."lectureId"='${id}'::uuid THEN RAISE EXCEPTION '${marker}'; END IF; RETURN NEW; END $$; CREATE TRIGGER g04_create_fault AFTER INSERT ON "Survey" FOR EACH ROW EXECUTE FUNCTION g04_create_fault()`);
    try {
        safe(await mutate(owner, 'post', '/api/surveys', { lectureId: id }), 500, 'INTERNAL_ERROR');
        expect((await pool.query('SELECT 1 FROM "Survey" WHERE "lectureId"=$1', [id])).rowCount).toBe(0);
        expect((await owner.agent.get(`/api/surveys?lectureId=${id}`).expect(200)).body.data.pagination.total).toBe(0);
    } finally { await pool.query('DROP TRIGGER g04_create_fault ON "Survey"; DROP FUNCTION g04_create_fault()'); }
    const created = (await mutate(owner, 'post', '/api/surveys', { lectureId: id }).expect(201)).body.data;
    expect(created.definitionRevision).toBe(1); expect(created.questions).toEqual([]);
});

it('G04-F03: physical loss after Draft COMMIT is reconciled by persisted definition without replay', async () => {
    const owner = await login(), d = await draft(owner);
    const input = wire(d); input.title = 'Committed despite lost acknowledgement'; input.questions[0].prompt = 'Persisted edit';
    proxy.arm('commit');
    safe(await mutate(owner, 'patch', `/api/surveys/${d.id}`, input), 500, 'INTERNAL_ERROR');
    expect(uncaught.map(error => error.message)).toEqual([]);
    expect(proxy.dropped()).toEqual({ operation: 'commit', commandTag: 'COMMIT', backendTransactionStatus: 'I' });
    const stored = (await owner.agent.get(`/api/surveys/${d.id}`).expect(200)).body.data;
    expect(stored.title).toBe(input.title); expect(stored.questions[0].prompt).toBe('Persisted edit');
    expect(stored.questions[0].id).toBe(d.questions[0].id); expect(stored.definitionRevision).toBe(d.definitionRevision + 1);
});

it('G04-F04: physical loss after response COMMIT preserves one response and own-status reconciliation', async () => {
    const owner = await login(), d = await published(owner), student = await login('respondent.11@example.test');
    proxy.arm('commit');
    safe(await mutate(student, 'post', `/api/surveys/${d.id}/responses`, payload(d)), 500, 'INTERNAL_ERROR');
    expect(uncaught.map(error => error.message)).toEqual([]);
    expect(proxy.dropped()).toEqual({ operation: 'commit', commandTag: 'COMMIT', backendTransactionStatus: 'I' });
    expect(await rows(d.id)).toEqual({ participation: 1, bundles: 1, answers: 1 });
    expect((await student.agent.get(`/api/surveys/${d.id}/my-submission`).expect(200)).body.data).toEqual({ surveyId: d.id, submitted: true, answers: payload(d).answers });
    const duplicate = await mutate(student, 'post', `/api/surveys/${d.id}/responses`, payload(d));
    expect(duplicate.status).toBe(409); expect(duplicate.body.error.code).toBe('RESPONSE_ALREADY_SUBMITTED');
    expect(await rows(d.id)).toEqual({ participation: 1, bundles: 1, answers: 1 });
});

it('G04-F05: a real two-connection deadlock aborts the route transaction and permits deliberate retry', async () => {
    const owner = await login(), d = await published(owner), student = await login('respondent.11@example.test');
    const control = await pool.connect(), reached = barrier(), resume = barrier();
    let controlWait: Promise<unknown> | undefined, pending: Promise<request.Response> | undefined, code: string | undefined, appPid: number | undefined;
    const controlPid = (await control.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;
    const restore = instrument(async (db, sql) => {
        if (!sql.startsWith('INSERT INTO "Answer"')) return;
        appPid = (await db.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;
        await db.query("SET LOCAL deadlock_timeout='100ms'"); reached.release(); await resume.promise;
        try { await db.query('SELECT pg_advisory_xact_lock(2504001)'); } catch (error) { code = (error as { code?: string }).code; throw error; }
    });
    try {
        await control.query("BEGIN; SET LOCAL deadlock_timeout='10s'; SET LOCAL lock_timeout='8s'; SET LOCAL statement_timeout='12s'; SELECT pg_advisory_xact_lock(2504001)");
        pending = mutate(student, 'post', `/api/surveys/${d.id}/responses`, payload(d)).then(r => r);
        await bounded(reached.promise);
        controlWait = control.query('SELECT id FROM "Survey" WHERE id=$1 FOR UPDATE', [d.id]);
        void controlWait.catch(() => undefined);
        await bounded((async () => {
            while (true) {
                const state = (await pool.query('SELECT pg_blocking_pids($1) AS blockers', [controlPid])).rows[0];
                if (state.blockers.includes(appPid)) return;
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        })());
        resume.release(); safe(await pending, 500, 'INTERNAL_ERROR'); await controlWait;
        expect(code).toBe('40P01');
        await control.query('ROLLBACK');
        expect(await rows(d.id)).toEqual({ participation: 0, bundles: 0, answers: 0 });
        expect((await student.agent.get(`/api/surveys/${d.id}/my-submission`).expect(200)).body.data.submitted).toBe(false);
    } finally {
        resume.release(); await controlWait?.catch(() => undefined); await control.query('ROLLBACK');
        await pending?.catch(() => undefined); restore(); control.release();
    }
    await mutate(student, 'post', `/api/surveys/${d.id}/responses`, payload(d)).expect(201);
    expect(await rows(d.id)).toEqual({ participation: 1, bundles: 1, answers: 1 });
});

it('G04-F06: PostgreSQL serialization-error injection rolls back preceding writes and permits retry', async () => {
    const owner = await login(), d = await published(owner), student = await login('respondent.11@example.test');
    await pool.query(`CREATE FUNCTION g04_serial_fault() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW."surveyId"='${d.id}'::uuid THEN RAISE EXCEPTION USING ERRCODE='40001',MESSAGE='${marker}'; END IF; RETURN NEW; END $$; CREATE TRIGGER g04_serial_fault AFTER INSERT ON "Answer" FOR EACH ROW EXECUTE FUNCTION g04_serial_fault()`);
    try {
        safe(await mutate(student, 'post', `/api/surveys/${d.id}/responses`, payload(d)), 500, 'INTERNAL_ERROR');
        expect(await rows(d.id)).toEqual({ participation: 0, bundles: 0, answers: 0 });
        expect((await student.agent.get(`/api/surveys/${d.id}/my-submission`).expect(200)).body.data.submitted).toBe(false);
    } finally { await pool.query('DROP TRIGGER g04_serial_fault ON "Answer"; DROP FUNCTION g04_serial_fault()'); }
    await mutate(student, 'post', `/api/surveys/${d.id}/responses`, payload(d)).expect(201);
    expect(await rows(d.id)).toEqual({ participation: 1, bundles: 1, answers: 1 });
});

it('G04-F07: exercised pool logger and normal/error routes omit known secret and feedback markers', async () => {
    const captured: unknown[][] = [];
    for (const method of ['error', 'warn', 'log', 'info'] as const) vi.spyOn(console, method).mockImplementation((...values) => { captured.push(values); });
    const owner = await login(), d = await published(owner), student = await login('respondent.11@example.test');
    (app.locals.auth.pool as Pool).emit('error', new Error(marker));
    expect(captured).toContainEqual(['Authentication database connection unavailable.']);
    const malformed = await mutate(student, 'post', `/api/surveys/${d.id}/responses`, { answers: [{ questionId: d.questions[0].id, value: marker }] });
    safe(malformed, 422, 'INVALID_ANSWERS');
    await mutate(student, 'post', `/api/surveys/${d.id}/responses`, payload(d)).expect(201);
    const log = JSON.stringify(captured);
    for (const sensitive of [marker, password, secret, owner.token, student.token, String(owner.logged.headers['set-cookie']![0]).split(';')[0]!, String(student.logged.headers['set-cookie']![0]).split(';')[0]!]) expect(log).not.toContain(sensitive);
});
