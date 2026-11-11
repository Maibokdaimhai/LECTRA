import { beforeAll, afterAll, beforeEach, afterEach, it, expect } from 'vitest';
import request from 'supertest';
import { request as httpRequest } from 'node:http';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { Pool } from 'pg';
import type { Express } from 'express';
import { assertTestDatabase } from '../../src/test-database.js';
import { readConfig } from '../../src/config.js';
import { createApp } from '../../src/app.js';
import { seedSyntheticDatabase } from '../../../../scripts/seed-database.js';
import { fixtureId } from '../../../../prisma/fixtures.js';
const origin = 'http://127.0.0.1:5173';
const password = process.env.RESTART_PASSWORD ?? randomBytes(24).toString('base64url');
const secret = randomBytes(32).toString('base64url');
const options = { testUrl: process.env.TEST_DATABASE_URL, developmentUrl: process.env.DATABASE_URL, allowName: process.env.ALLOW_TEST_DATABASE };
const expected = assertTestDatabase(options);
if (process.env.ALLOW_FEATURE_TESTS !== expected)
    throw new Error('Feature tests require explicit ALLOW_FEATURE_TESTS and a new empty disposable database.');
const pool = new Pool({ connectionString: options.testUrl, options: '-c timezone=UTC' });
let app: Express;
let clock = Date.now();
const config = readConfig({ NODE_ENV: 'test', APP_ORIGIN: origin, DATABASE_URL: options.testUrl, SESSION_SECRET: secret });
beforeAll(async () => {
    expect((await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public'")).rowCount).toBe(0);
    execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { env: { ...process.env, DATABASE_URL: options.testUrl }, stdio: 'pipe' });
    await seedSyntheticDatabase({ ...options, seedName: expected, ownerPassword: password, respondentPassword: password });
});
beforeEach(() => { clock = Date.now(); app = createApp(config, () => clock); });
afterEach(async () => { await app.locals.close(); });
afterAll(async () => { await pool.end(); });
async function login(email = 'owner.1@example.test') {
    const agent = request.agent(app);
    const boot = await agent.get('/api/auth/session').expect(200);
    const logged = await agent.post('/api/auth/login').set('Origin', origin).set('X-CSRF-Token', boot.body.data.csrfToken).send({ email, password }).expect(200);
    return { agent, token: logged.body.data.csrfToken as string, logged, boot };
}
it('TEST-F01-I01/I03/I04/I07: bootstrap persists; login regenerates SID/token and returns trusted projection', async () => {
    const { agent, logged, boot } = await login('  OWNER.1@EXAMPLE.TEST  ');
    expect(logged.body.data.csrfToken).not.toBe(boot.body.data.csrfToken);
    expect(String(logged.headers['set-cookie']![0])).not.toBe(String(boot.headers['set-cookie']![0]));
    expect(Object.keys(logged.body.data.user).sort()).toEqual(['displayName', 'id', 'role']);
    expect(logged.body.data.user.id).toBe(fixtureId(1));
    expect((await agent.get('/api/auth/me').expect(200)).body.data.user.role).toBe('OWNER');
    const repeated = await agent.get('/api/auth/session').expect(200);
    expect(repeated.body.data.csrfToken).toBe(logged.body.data.csrfToken);
    expect(repeated.body.data.expiresAt).toBe(logged.body.data.expiresAt);
    expect(repeated.headers['set-cookie']).toBeUndefined();
    expect((await pool.query('SELECT count(*)::int AS n FROM auth_session')).rows[0].n).toBeGreaterThan(0);
});
it('TEST-F01-I05/I15: generic credential errors, exact schemas and body security', async () => {
    const agent = request.agent(app);
    const boot = await agent.get('/api/auth/session').expect(200);
    const post = (body: object) => agent.post('/api/auth/login').set('Origin', origin).set('X-CSRF-Token', boot.body.data.csrfToken).send(body);
    const wrong = await post({ email: 'owner.1@example.test', password: 'incorrect' }).expect(401);
    const absent = await post({ email: 'missing@example.test', password: 'incorrect' }).expect(401);
    expect(wrong.body).toEqual(absent.body);
    await post({ email: 'owner.1@example.test', password, role: 'OWNER' }).expect(422);
    await agent.post('/api/auth/login').send({ email: 'owner.1@example.test', password }).expect(403);
    await agent.post('/api/auth/login').set('Origin', origin).send({ email: 'owner.1@example.test', password }).expect(403);
    await agent.post('/api/auth/login').set('Origin', origin).set('Content-Type', 'text/plain').send('x').expect(415);
    await agent.post('/api/auth/login').set('Origin', origin).set('Content-Type', 'application/json').send('x'.repeat(8193)).expect(413);
});
it('R40-01 / TEST-F01-I18: an exact-expiry persistence failure cannot leave a login cookie or usable session', async () => {
    // The old two-statement store committed a rounded INSERT, then failed its
    // exact-expiry UPDATE. The same trigger rejects the fixed atomic INSERT.
    clock = Math.floor(Date.now() / 1000) * 1000 + 123;
    const agent = request.agent(app);
    const boot = await agent.get('/api/auth/session').expect(200);
    const guestCookie = String(boot.headers['set-cookie']![0]).split(';')[0]!;
    const before = (await pool.query("SELECT sid FROM auth_session WHERE sess->>'userId'=$1", [fixtureId(1)])).rows.map(r => r.sid);
    await pool.query(`CREATE FUNCTION r40_reject_exact_auth_expiry() RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN
          IF NEW.sess->>'userId' IS NOT NULL AND NEW.expire =
            (to_timestamp((NEW.sess->>'authExpiresAt')::double precision / 1000) AT TIME ZONE 'UTC') THEN
            RAISE EXCEPTION 'controlled session persistence failure';
          END IF;
          RETURN NEW;
        END $$`);
    try {
        await pool.query('CREATE TRIGGER r40_auth_expiry BEFORE INSERT OR UPDATE ON auth_session FOR EACH ROW EXECUTE FUNCTION r40_reject_exact_auth_expiry()');
        const failed = await agent.post('/api/auth/login').set('Origin', origin).set('X-CSRF-Token', boot.body.data.csrfToken).send({ email: 'owner.1@example.test', password });
        expect.soft(failed.status).toBe(503);
        expect.soft(failed.body).toEqual({ error: { code: 'AUTH_SERVICE_UNAVAILABLE', message: 'Request could not be completed.' } });
        const cookies = failed.headers['set-cookie'] as string[] | undefined;
        expect.soft((cookies ?? []).every(c => /^lectra\.sid=;/.test(c))).toBe(true);
        const after = (await pool.query("SELECT sid FROM auth_session WHERE sess->>'userId'=$1", [fixtureId(1)])).rows.map(r => r.sid);
        expect.soft(after.sort()).toEqual(before.sort());
        // Restore storage before replay: the denial must not depend on an outage.
        await pool.query('DROP TRIGGER r40_auth_expiry ON auth_session');
        expect.soft((await agent.get('/api/auth/me')).status).toBe(401);
        expect.soft((await request(app).get('/api/auth/me').set('Cookie', guestCookie)).status).toBe(401);
        for (const cookie of cookies ?? [])
            expect.soft((await request(app).get('/api/auth/me').set('Cookie', cookie.split(';')[0]!)).status).toBe(401);
        // A deliberate fresh login after recovery still works.
        const recovered = await login();
        await recovered.agent.get('/api/auth/me').expect(200);
    }
    finally {
        await pool.query('DROP TRIGGER IF EXISTS r40_auth_expiry ON auth_session');
        await pool.query('DROP FUNCTION r40_reject_exact_auth_expiry()');
    }
});
it('TEST-F01-I08/I16/I17: expiry is absolute and logout revokes a replayed cookie', async () => {
    const { agent, token, logged } = await login();
    const saved = String(logged.headers['set-cookie']![0]).split(';')[0]!;
    await agent.post('/api/auth/logout').set('Origin', origin).set('X-CSRF-Token', token).send({}).expect(204);
    await request(app).get('/api/auth/me').set('Cookie', saved).expect(401);
    await request(app).post('/api/auth/logout').set('Cookie', saved).set('Origin', origin).set('X-CSRF-Token', token).send({}).expect(204);
    const next = await login();
    clock += 28800000;
    const expired = await next.agent.get('/api/auth/me').expect(401);
    expect(expired.body.error.code).toBe('SESSION_EXPIRED');
    await next.agent.get('/api/auth/session').expect(200);
});
it('TEST-F01-I09/I28: trusted role is resolved anew and authenticated login does not switch accounts', async () => {
    const { agent, token } = await login();
    await agent.post('/api/auth/login').set('Origin', origin).set('X-CSRF-Token', token).send({ email: 'owner.2@example.test', password }).expect(409);
    await pool.query('UPDATE "User" SET role=\'RESPONDENT\' WHERE id=$1', [fixtureId(1)]);
    try {
        expect((await agent.get('/api/auth/me').expect(200)).body.data.user.role).toBe('RESPONDENT');
    }
    finally {
        await pool.query('UPDATE "User" SET role=\'OWNER\' WHERE id=$1', [fixtureId(1)]);
    }
});
it('TEST-F01-I14/I22: old tokens fail; the eleventh valid-shape login is throttled', async () => {
    const { agent, token, boot } = await login();
    await agent.post('/api/auth/logout').set('Origin', origin).set('X-CSRF-Token', boot.body.data.csrfToken).send({}).expect(403);
    await agent.post('/api/auth/logout').set('Origin', origin).set('X-CSRF-Token', token).send({}).expect(204);
    const newBoot = await agent.get('/api/auth/session').expect(200);
    for (let i = 0; i < 9; i++)
        await agent.post('/api/auth/login').set('Origin', origin).set('X-CSRF-Token', newBoot.body.data.csrfToken).send({ email: 'missing@example.test', password }).expect(401);
    const rejected = await agent.post('/api/auth/login').set('Origin', origin).set('X-CSRF-Token', newBoot.body.data.csrfToken).send({ email: 'missing@example.test', password }).expect(429);
    expect(rejected.headers['retry-after']).toMatch(/^\d+$/);
});
let surveyId: string;
let ratingId: string;
let textId: string;
const mutation = (client: Awaited<ReturnType<typeof login>>, method: 'post' | 'patch' | 'delete', path: string, body: object) => client.agent[method](path).set('Origin', origin).set('X-CSRF-Token', client.token).send(body);
it('F-02: owner context is scoped even within a shared Course, and query pagination is strict', async () => {
    const owner = await login();
    const courses = await owner.agent.get('/api/courses').expect(200);
    expect(courses.body.data.items).toHaveLength(2);
    const sections = await owner.agent.get(`/api/sections?courseId=${fixtureId(101)}`).expect(200);
    expect(sections.body.data.items.map((s: {
        id: string;
    }) => s.id)).toEqual([fixtureId(201)]);
    await owner.agent.get(`/api/sections/${fixtureId(202)}/lectures`).expect(404);
    await owner.agent.get('/api/courses?limit=01').expect(422);
    await owner.agent.get('/api/courses?limit=1&limit=2').expect(422);
    const student = await login('respondent.11@example.test');
    await student.agent.get('/api/courses').expect(403);
    expect((await student.agent.get('/api/surveys').expect(200)).body.data.items).toEqual([]);
    await request(app).get('/api/courses').expect(401);
});
it('F-03: one-survey uniqueness, stable definitions/revisions, foreign owner rejection and publication snapshot', async () => {
    const owner = await login();
    const created = await mutation(owner, 'post', '/api/surveys', { lectureId: fixtureId(302) }).expect(201);
    surveyId = created.body.data.id;
    await mutation(owner, 'post', '/api/surveys', { lectureId: fixtureId(302) }).expect(409);
    await mutation(owner, 'post', '/api/surveys', { lectureId: fixtureId(303) }).expect(404);
    const body = { expectedRevision: 1, title: ' Clear lecture feedback ', questions: [
            { id: null, type: 'RATING', prompt: 'Understanding', required: true, ratingScale: { min: 1, max: 5, minLabel: 'Low', maxLabel: 'High', interpretation: 'Higher means clearer' } },
            { id: null, type: 'TEXT', prompt: 'Next time', required: false, ratingScale: null }
        ] };
    const saved = await mutation(owner, 'patch', `/api/surveys/${surveyId}`, body).expect(200);
    expect(saved.body.data.definitionRevision).toBe(2);
    [ratingId, textId] = saved.body.data.questions.map((q: {
        id: string;
    }) => q.id);
    await mutation(owner, 'patch', `/api/surveys/${surveyId}`, body).expect(409);
    const noOp = { ...body, expectedRevision: 2, questions: body.questions.map((q, i) => ({ ...q, id: i ? textId : ratingId })) };
    expect((await mutation(owner, 'patch', `/api/surveys/${surveyId}`, noOp).expect(200)).body.data.definitionRevision).toBe(2);
    const foreign = await login('owner.2@example.test');
    await foreign.agent.get(`/api/surveys/${surveyId}`).expect(404);
    await mutation(owner, 'post', `/api/surveys/${surveyId}/publish`, { expectedRevision: 2 }).expect(200);
    expect((await pool.query('SELECT count(*)::int AS n FROM "SurveyEligibility" WHERE "surveyId"=$1', [surveyId])).rows[0].n).toBe(2);
    await mutation(owner, 'patch', `/api/surveys/${surveyId}`, noOp).expect(409);
    const student = await login('respondent.11@example.test');
    const form = await student.agent.get(`/api/surveys/${surveyId}`).expect(200);
    expect(form.body.data.definitionRevision).toBeUndefined();
    expect(form.body.data.privacyDisclosure).toContain('identified');
});
it('F-04: required/type/Unicode/association boundaries reject without any partial response', async () => {
    const student = await login('respondent.11@example.test');
    for (const answers of [[], [{ questionId: ratingId, value: 0 }], [{ questionId: ratingId, value: '5' }], [{ questionId: textId, value: 'x' }], [{ questionId: ratingId, value: 5 }, { questionId: textId, value: 'x'.repeat(2001) }], [{ questionId: fixtureId(501), value: 5 }], [{ questionId: ratingId, value: 5 }, { questionId: ratingId, value: 4 }]]) {
        await mutation(student, 'post', `/api/surveys/${surveyId}/responses`, { answers }).expect(422);
    }
    expect((await pool.query('SELECT count(*)::int AS n FROM "Participation" WHERE "surveyId"=$1', [surveyId])).rows[0].n).toBe(0);
    const other = await login('respondent.13@example.test');
    await mutation(other, 'post', `/api/surveys/${surveyId}/responses`, { answers: [{ questionId: ratingId, value: 5 }] }).expect(404);
    await student.agent.get(`/api/surveys/${fixtureId(401)}`).expect(404);
    await mutation(student, 'post', `/api/surveys/${fixtureId(401)}/responses`, { answers: [] }).expect(404);
});
it('F-04/F-05: concurrent duplicate submits persist exactly one result; privacy projection and close ordering', async () => {
    const student = await login('respondent.11@example.test');
    const body = { answers: [{ questionId: ratingId, value: 5 }, { questionId: textId, value: '<script>private content</script>\nNext lesson' }] };
    const results = await Promise.all([mutation(student, 'post', `/api/surveys/${surveyId}/responses`, body), mutation(student, 'post', `/api/surveys/${surveyId}/responses`, body)]);
    expect(results.map(r => r.status).sort()).toEqual([201, 409]);
    const malformed = await mutation(student, 'post', `/api/surveys/${surveyId}/responses`, {answers: [], studentId: fixtureId(12)}).expect(422);
    expect(malformed.body.error.code).toBe('INVALID_REQUEST');
    const own = await student.agent.get(`/api/surveys/${surveyId}/my-submission`).expect(200);
    expect(own.body.data.submitted).toBe(true);
    expect(own.body.data.answers).toEqual(body.answers);
    await student.agent.get(`/api/surveys/${surveyId}/my-submission?studentId=${fixtureId(12)}`).expect(422);
    const owner = await login();
    const live = await owner.agent.get(`/api/surveys/${surveyId}/results`).expect(200);
    expect(live.headers['cache-control']).toBe('private, no-store');
    expect(live.body.data.responseCount).toBe(1);
    expect(live.body.data.questions).toBeUndefined();
    await student.agent.get(`/api/surveys/${surveyId}/results`).expect(403);
    await mutation(owner, 'post', `/api/surveys/${surveyId}/close`, {}).expect(200);
    await mutation(student, 'post', `/api/surveys/${surveyId}/responses`, body).expect(409);
    const summary = await owner.agent.get(`/api/surveys/${surveyId}/results`).expect(200);
    expect(summary.body.data.questions[0].mean).toBe('5.00');
    expect(summary.body.data.questions[0].distribution.map((b: {
        count: number;
    }) => b.count)).toEqual([0, 0, 0, 0, 1]);
    expect(summary.body.data.questions[1].comments).toEqual([body.answers[1]!.value]);
    expect(JSON.stringify(summary.body)).not.toContain(fixtureId(11));
    const foreign = await login('owner.2@example.test');
    await foreign.agent.get(`/api/surveys/${surveyId}/results`).expect(404);
    await app.locals.close();
    app = createApp(config, () => clock);
    const replay = String(student.logged.headers['set-cookie']![0]).split(';')[0]!;
    expect((await request(app).get(`/api/surveys/${surveyId}/my-submission`).set('Cookie', replay).expect(200)).body.data.answers).toEqual(body.answers);
});
it('F-04: an actual SQL fault after participation/bundle insertion rolls the entire submission back', async () => {
    const owner = await login();
    await mutation(owner, 'post', `/api/surveys/${fixtureId(401)}/publish`, { expectedRevision: 1 }).expect(200);
    const student = await login('respondent.12@example.test');
    await pool.query(`CREATE FUNCTION fail_answer_test() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Injected storage failure'; END $$; CREATE TRIGGER fail_answer_test BEFORE INSERT ON "Answer" FOR EACH ROW EXECUTE FUNCTION fail_answer_test()`);
    try {
        await mutation(student, 'post', `/api/surveys/${fixtureId(401)}/responses`, { answers: [{ questionId: fixtureId(501), value: 4 }] }).expect(500);
    }
    finally {
        await pool.query('DROP TRIGGER fail_answer_test ON "Answer"; DROP FUNCTION fail_answer_test()');
    }
    expect((await pool.query('SELECT count(*)::int AS n FROM "Participation" WHERE "surveyId"=$1', [fixtureId(401)])).rows[0].n).toBe(0);
    expect((await pool.query('SELECT count(*)::int AS n FROM "ResponseBundle" WHERE "surveyId"=$1', [fixtureId(401)])).rows[0].n).toBe(0);
    expect((await student.agent.get(`/api/surveys/${fixtureId(401)}/my-submission`).expect(200)).body.data.submitted).toBe(false);
});
async function publishedFixture(owner: Awaited<ReturnType<typeof login>>, sequence: number) {
    const lecture = (await pool.query('INSERT INTO "Lecture" ("sectionId",title,"lectureDate",sequence) VALUES ($1,$2,\'2026-11-09\',$3) RETURNING id', [fixtureId(201), 'Race fixture', sequence])).rows[0].id;
    const created = await mutation(owner, 'post', '/api/surveys', { lectureId: lecture }).expect(201);
    const id = created.body.data.id;
    const saved = await mutation(owner, 'patch', `/api/surveys/${id}`, { expectedRevision: 1, title: 'Race fixture', questions: [{ id: null, type: 'RATING', prompt: 'Understanding', required: true, ratingScale: { min: 1, max: 5, minLabel: 'Low', maxLabel: 'High', interpretation: 'Higher means clearer' } }] }).expect(200);
    await mutation(owner, 'post', `/api/surveys/${id}/publish`, { expectedRevision: 2 }).expect(200);
    return { id, question: saved.body.data.questions[0].id };
}
async function waitingConnections(count: number) {
    const end = Date.now() + 4000;
    while (Date.now() < end) {
        const n = Number((await pool.query("SELECT count(*) AS n FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND pid<>pg_backend_pid()")).rows[0].n);
        if (n >= count)
            return;
        await new Promise(r => setTimeout(r, 10));
    }
    throw new Error('Expected overlapping API transactions to wait on the held Survey lock');
}
it('F-03/F-04: actual API close and submit serialize correctly in both lock orders', async () => {
    const owner = await login(), student = await login('respondent.11@example.test');
    for (const [index, submitFirst] of [true, false].entries()) {
        const fixture = await publishedFixture(owner, 1001 + index);
        const blocker = await pool.connect();
        try {
            await blocker.query('BEGIN');
            await blocker.query('SELECT id FROM "Survey" WHERE id=$1 FOR UPDATE', [fixture.id]);
            const send = () => mutation(student, 'post', `/api/surveys/${fixture.id}/responses`, { answers: [{ questionId: fixture.question, value: 3 }] }).then(r => r);
            const close = () => mutation(owner, 'post', `/api/surveys/${fixture.id}/close`, {}).then(r => r);
            const first = submitFirst ? send() : close();
            await waitingConnections(1);
            const second = submitFirst ? close() : send();
            await waitingConnections(2);
            await blocker.query('COMMIT');
            const [a, b] = await Promise.all([first, second]);
            expect([a.status, b.status]).toEqual(submitFirst ? [201, 200] : [200, 409]);
            expect(Number((await pool.query('SELECT count(*) AS n FROM "Participation" WHERE "surveyId"=$1', [fixture.id])).rows[0].n)).toBe(submitFirst ? 1 : 0);
        }
        finally {
            await blocker.query('ROLLBACK');
            blocker.release();
        }
    }
});
it('F-01: session-store failures return safe 503 and never create a memory fallback', async () => {
    const client = await login();
    await pool.query('ALTER TABLE auth_session RENAME TO auth_session_unavailable');
    try {
        const response = await client.agent.get('/api/auth/me').expect(503);
        expect(response.body.error.code).toBe('AUTH_SERVICE_UNAVAILABLE');
        expect(JSON.stringify(response.body)).not.toContain('auth_session');
    }
    finally {
        await pool.query('ALTER TABLE auth_session_unavailable RENAME TO auth_session');
    }
    await client.agent.get('/api/auth/me').expect(200);
});
it('F-05: corrupted persisted type/denominator data fails closed rather than producing plausible analytics', async () => {
    const owner = await login();
    const row = (await pool.query('SELECT "bundleId" FROM "Answer" WHERE "surveyId"=$1 AND "questionId"=$2', [surveyId, ratingId])).rows[0];
    await pool.query('UPDATE "Answer" SET "ratingValue"=NULL,"textValue"=\'corrupt type\' WHERE "bundleId"=$1 AND "questionId"=$2', [row.bundleId, ratingId]);
    try {
        const response = await owner.agent.get(`/api/surveys/${surveyId}/results`).expect(500);
        expect(response.body.error.code).toBe('RESULTS_INCONSISTENT');
        expect(response.body.data).toBeUndefined();
    }
    finally {
        await pool.query('UPDATE "Answer" SET "ratingValue"=5,"textValue"=NULL WHERE "bundleId"=$1 AND "questionId"=$2', [row.bundleId, ratingId]);
    }
});
it('F01-store: persisted and cookie expiry never extend past the exact absolute millisecond deadline', async () => {
    clock = Math.floor(Date.now() / 1000) * 1000 + 123;
    const client = await login();
    const deadline = Date.parse(client.logged.body.data.expiresAt);
    const cookie = String(client.logged.headers['set-cookie']![0]).split(';')[0]!;
    const sid = decodeURIComponent(cookie.slice(cookie.indexOf('=') + 1)).slice(2).split('.')[0]!;
    const stored = (await pool.query(`SELECT extract(epoch FROM expire AT TIME ZONE 'UTC')*1000 AS ms,sess FROM auth_session WHERE sid=$1`, [sid])).rows;
    expect(stored).toHaveLength(1);
    expect(Number(stored[0].ms)).toBe(deadline);
    await client.agent.get('/api/auth/me').expect(200);
    expect(Number((await pool.query(`SELECT extract(epoch FROM expire AT TIME ZONE 'UTC')*1000 AS ms FROM auth_session WHERE sid=$1`, [sid])).rows[0].ms)).toBe(deadline);
});
it('TEST-F01-I19/I21: reads overlapping logout never resurrect the cookie; independent sessions remain usable', async () => {
    const a = await login(), b = await login();
    const cookie = String(a.logged.headers['set-cookie']![0]).split(';')[0]!;
    const results = await Promise.all([a.agent.get('/api/auth/me'), mutation(a, 'post', '/api/auth/logout', {})]);
    expect([200, 401]).toContain(results[0]!.status);
    expect(results[1]!.status).toBe(204);
    await request(app).get('/api/auth/me').set('Cookie', cookie).expect(401);
    await b.agent.get('/api/auth/me').expect(200);
});
it('F-01: unsupported methods, foreign origins and forged cookies fail without authority', async () => {
    await request(app).get('/api/auth/logout').expect(405);
    await request(app).get('/api/auth/session').set('Origin', 'null').expect(403);
    await request(app).get('/api/auth/session').set('Sec-Fetch-Site', 'cross-site').expect(403);
    await request(app).get('/api/auth/me').set('Cookie', 'lectra.sid=s%3Aforged.signature').expect(401);
    const user = await login();
    const response = await user.agent.head('/api/courses').expect(405);
    expect(response.headers.allow).toBe('GET');
    await user.agent.get(`/api/surveys/${surveyId}/results?studentId=${fixtureId(11)}`).expect(422);
});
it('F-03: concurrent Draft edit and publication commit only a consistent frozen revision', async () => {
    const owner = await login();
    const lecture = (await pool.query('INSERT INTO "Lecture" ("sectionId",title,"lectureDate",sequence) VALUES ($1,\'Edit/publish race\',\'2026-11-09\',1003) RETURNING id', [fixtureId(201)])).rows[0].id;
    const created = await mutation(owner, 'post', '/api/surveys', { lectureId: lecture }).expect(201);
    const id = created.body.data.id;
    const input = { expectedRevision: 1, title: 'Before publish', questions: [{ id: null, type: 'RATING', prompt: 'Clarity', required: true, ratingScale: { min: 1, max: 5, minLabel: 'Low', maxLabel: 'High', interpretation: 'Higher means clearer' } }] };
    const saved = await mutation(owner, 'patch', `/api/surveys/${id}`, input).expect(200);
    const edited = { ...input, expectedRevision: 2, title: 'Edited concurrently', questions: saved.body.data.questions.map(({ id, prompt, type, required, ratingScale }: QuestionInput) => ({ id, prompt, type, required, ratingScale })) };
    const [edit, publish] = await Promise.all([mutation(owner, 'patch', `/api/surveys/${id}`, edited), mutation(owner, 'post', `/api/surveys/${id}/publish`, { expectedRevision: 2 })]);
    expect([edit.status, publish.status].sort()).toEqual([200, 409]);
    const persisted = (await owner.agent.get(`/api/surveys/${id}`).expect(200)).body.data;
    if (publish.status === 200) {
        expect(persisted.status).toBe('PUBLISHED');
        expect(persisted.title).toBe('Before publish');
    }
    else {
        expect(persisted.status).toBe('DRAFT');
        expect(persisted.title).toBe('Edited concurrently');
        expect(persisted.definitionRevision).toBe(3);
    }
});
type QuestionInput = {
    id: string;
    prompt: string;
    type: string;
    required: boolean;
    ratingScale: unknown;
};
it('R3: publication validates and freezes one membership snapshot while membership changes concurrently', async () => {
    const owner = await login();
    const lecture = (await pool.query('INSERT INTO "Lecture" ("sectionId",title,"lectureDate",sequence) VALUES ($1,\'Membership snapshot race\',\'2026-11-09\',1004) RETURNING id', [fixtureId(201)])).rows[0].id;
    const id = (await mutation(owner, 'post', '/api/surveys', { lectureId: lecture }).expect(201)).body.data.id;
    await mutation(owner, 'patch', `/api/surveys/${id}`, { expectedRevision: 1, title: 'Membership snapshot race', questions: [{ id: null, type: 'RATING', prompt: 'Clarity', required: true, ratingScale: { min: 1, max: 5, minLabel: 'Low', maxLabel: 'High', interpretation: 'Higher means clearer' } }] }).expect(200);
    const gate = await pool.connect();
    let publication: Promise<request.Response> | undefined;
    // Test-only view delays the first membership read after its statement snapshot is taken.
    // The writer commits a different valid membership set before that read is released.
    await pool.query(`ALTER TABLE "Membership" RENAME TO membership_r3_source;
        CREATE FUNCTION membership_r3_gate() RETURNS boolean LANGUAGE plpgsql VOLATILE AS $$ BEGIN PERFORM pg_advisory_xact_lock(36003); RETURN true; END $$;
        CREATE VIEW "Membership" AS SELECT * FROM membership_r3_source WHERE membership_r3_gate()`);
    try {
        await gate.query('SELECT pg_advisory_lock(36003)');
        publication = mutation(owner, 'post', `/api/surveys/${id}/publish`, { expectedRevision: 2 }).then(r => r);
        let waiting = false;
        const deadline = Date.now() + 3000;
        while (Date.now() < deadline) {
            waiting = !!(await pool.query("SELECT 1 FROM pg_stat_activity WHERE wait_event='advisory' AND query LIKE '%Membership%' AND pid<>pg_backend_pid()")).rowCount;
            if (waiting) break;
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        expect(waiting).toBe(true);
        await pool.query('DELETE FROM membership_r3_source WHERE "sectionId"=$1 AND "studentId"=$2', [fixtureId(201), fixtureId(12)]);
        await pool.query('INSERT INTO membership_r3_source ("sectionId","studentId") VALUES ($1,$2)', [fixtureId(201), fixtureId(13)]);
        await gate.query('SELECT pg_advisory_unlock(36003)');
        expect((await publication).status).toBe(200);
        expect((await pool.query('SELECT "studentId" FROM "SurveyEligibility" WHERE "surveyId"=$1 ORDER BY "studentId"', [id])).rows.map(r => r.studentId)).toEqual([fixtureId(11), fixtureId(12)]);
    }
    finally {
        await gate.query('SELECT pg_advisory_unlock_all()');
        if (publication) await publication;
        gate.release();
        await pool.query('DROP VIEW "Membership"; DROP FUNCTION membership_r3_gate(); ALTER TABLE membership_r3_source RENAME TO "Membership"');
        await pool.query('DELETE FROM "Membership" WHERE "sectionId"=$1 AND "studentId"=$2', [fixtureId(201), fixtureId(13)]);
        await pool.query('INSERT INTO "Membership" ("sectionId","studentId") VALUES ($1,$2) ON CONFLICT DO NOTHING', [fixtureId(201), fixtureId(12)]);
    }
});
it('R3: invalid and empty membership snapshots leave the Draft and eligibility unchanged', async () => {
    const owner = await login();
    for (const [section, sequence, code] of [[fixtureId(203), 1005, 'ELIGIBILITY_EMPTY'], [fixtureId(201), 1006, 'ELIGIBILITY_INVALID']] as const) {
        const lecture = (await pool.query('INSERT INTO "Lecture" ("sectionId",title,"lectureDate",sequence) VALUES ($1,\'Rejected membership snapshot\',\'2026-11-09\',$2) RETURNING id', [section, sequence])).rows[0].id;
        const id = (await mutation(owner, 'post', '/api/surveys', { lectureId: lecture }).expect(201)).body.data.id;
        await mutation(owner, 'patch', `/api/surveys/${id}`, { expectedRevision: 1, title: 'Rejected snapshot', questions: [{ id: null, type: 'RATING', prompt: 'Clarity', required: true, ratingScale: { min: 1, max: 5, minLabel: 'Low', maxLabel: 'High', interpretation: 'Higher means clearer' } }] }).expect(200);
        if (code === 'ELIGIBILITY_INVALID') await pool.query('INSERT INTO "Membership" ("sectionId","studentId") VALUES ($1,$2)', [section, fixtureId(2)]);
        try {
            const response = await mutation(owner, 'post', `/api/surveys/${id}/publish`, { expectedRevision: 2 }).expect(422);
            expect(response.body.error.code).toBe(code);
            expect((await pool.query('SELECT status,"publishedAt" FROM "Survey" WHERE id=$1', [id])).rows[0]).toEqual({ status: 'DRAFT', publishedAt: null });
            expect((await pool.query('SELECT 1 FROM "SurveyEligibility" WHERE "surveyId"=$1', [id])).rowCount).toBe(0);
        } finally {
            if (code === 'ELIGIBILITY_INVALID') await pool.query('DELETE FROM "Membership" WHERE "sectionId"=$1 AND "studentId"=$2', [section, fixtureId(2)]);
        }
    }
});
it('N4: explicitly empty lecture filter fails validation instead of returning all surveys', async () => {
    const owner = await login();
    for (const query of ['lectureId=', 'lectureId=%20', 'lectureId=not-a-uuid', `lectureId=&lectureId=${fixtureId(301)}`]) {
        const response = await owner.agent.get(`/api/surveys?${query}`).expect(422);
        expect(response.body.error.code).toBe('VALIDATION_FAILED');
    }
    const filtered = (await owner.agent.get(`/api/surveys?lectureId=${fixtureId(301)}`).expect(200)).body.data;
    expect(filtered.items.map((s: { id: string }) => s.id)).toEqual([fixtureId(401)]);
    await owner.agent.get('/api/surveys').expect(200);
});
it('N5: owner and eligible student list projections contain the required survey context', async () => {
    for (const email of ['owner.1@example.test', 'respondent.11@example.test']) {
        const client = await login(email);
        const items = (await client.agent.get('/api/surveys').expect(200)).body.data.items;
        const survey = items.find((s: { id: string }) => s.id === fixtureId(401));
        expect(survey.course).toMatchObject({ code: 'SYN-CPE334', title: 'Synthetic Software Engineering' });
        expect(survey.section).toMatchObject({ sectionCode: 'A', term: 'Synthetic term' });
        expect(survey.lecture).toMatchObject({ lectureDate: '2026-11-08', title: 'Synthetic lecture one' });
        expect(survey.mode).toBe('IDENTIFIED');
        expect(survey.answers).toBeUndefined();
    }
});

// Issue #22: fresh per-scenario surveys extend the integrated suite rather than replacing it.
let integrationSequence = 2200;
async function integrationDraft(owner: Awaited<ReturnType<typeof login>>, extra: object[] = []) {
    const lecture = (await pool.query('INSERT INTO "Lecture" ("sectionId",title,"lectureDate",sequence) VALUES ($1,\'Issue 22 integration\',\'2026-11-09\',$2) RETURNING id', [fixtureId(201), ++integrationSequence])).rows[0].id;
    const id = (await mutation(owner, 'post', '/api/surveys', { lectureId: lecture }).expect(201)).body.data.id;
    const body = { expectedRevision: 1, title: 'Issue 22 integration', questions: [{ id: null, type: 'RATING', prompt: 'Required rating', required: true, ratingScale: { min: 1, max: 5, minLabel: 'Slow', maxLabel: 'Fast', interpretation: 'Speed, not quality' } }, ...extra] };
    const saved = (await mutation(owner, 'patch', `/api/surveys/${id}`, body).expect(200)).body.data;
    return { id, lecture, body: { ...body, expectedRevision: 2, questions: saved.questions.map(({ id, prompt, type, required, ratingScale }: QuestionInput) => ({ id, prompt, type, required, ratingScale })) }, questions: saved.questions as QuestionInput[] };
}
async function responseRows(id: string) {
    return (await pool.query(`SELECT (SELECT count(*)::int FROM "Participation" WHERE "surveyId"=$1) AS participation,
        (SELECT count(*)::int FROM "ResponseBundle" WHERE "surveyId"=$1) AS bundles,
        (SELECT count(*)::int FROM "Answer" WHERE "surveyId"=$1) AS answers`, [id])).rows[0];
}
it('INT22-01: concurrent create produces one Draft and one conflict for the same owned lecture', async () => {
    const owner = await login();
    const lecture = (await pool.query('INSERT INTO "Lecture" ("sectionId",title,"lectureDate",sequence) VALUES ($1,\'Concurrent creates\',\'2026-11-09\',$2) RETURNING id', [fixtureId(201), ++integrationSequence])).rows[0].id;
    const results = await Promise.all([mutation(owner, 'post', '/api/surveys', { lectureId: lecture }), mutation(owner, 'post', '/api/surveys', { lectureId: lecture })]);
    expect(results.map(r => r.status).sort()).toEqual([201, 409]);
    expect(results.find(r => r.status === 409)!.body.error.code).toBe('SURVEY_ALREADY_EXISTS');
    expect((await pool.query('SELECT status,"definitionRevision" FROM "Survey" WHERE "lectureId"=$1', [lecture])).rows).toEqual([{ status: 'DRAFT', definitionRevision: 1 }]);
});
it('INT22-02: frozen eligibility survives live membership changes and definitions remain immutable', async () => {
    const owner = await login(), previous = await login('respondent.12@example.test'), added = await login('respondent.13@example.test');
    const f = await integrationDraft(owner);
    await mutation(owner, 'post', `/api/surveys/${f.id}/publish`, { expectedRevision: 2 }).expect(200);
    await pool.query('DELETE FROM "Membership" WHERE "sectionId"=$1 AND "studentId"=$2', [fixtureId(201), fixtureId(12)]);
    await pool.query('INSERT INTO "Membership" ("sectionId","studentId") VALUES ($1,$2)', [fixtureId(201), fixtureId(13)]);
    try {
        // TEST-F02-I10 / AC-F02-08: discovery must use frozen eligibility,
        // independently of the detail/submission checks below.
        const previousList = (await previous.agent.get('/api/surveys?limit=100').expect(200)).body.data.items;
        const addedList = (await added.agent.get('/api/surveys?limit=100').expect(200)).body.data.items;
        expect(previousList.some((s: { id: string }) => s.id === f.id)).toBe(true);
        expect(addedList.some((s: { id: string }) => s.id === f.id)).toBe(false);
        const frozen = (await previous.agent.get(`/api/surveys/${f.id}`).expect(200)).body.data;
        expect(frozen.questions[0].ratingScale.interpretation).toBe('Speed, not quality');
        await added.agent.get(`/api/surveys/${f.id}`).expect(404);
        await mutation(added, 'post', `/api/surveys/${f.id}/responses`, { answers: [{ questionId: f.questions[0]!.id, value: 4 }] }).expect(404);
        await mutation(previous, 'post', `/api/surveys/${f.id}/responses`, { answers: [{ questionId: f.questions[0]!.id, value: 4 }] }).expect(201);
        await mutation(owner, 'patch', `/api/surveys/${f.id}`, { ...f.body, title: 'Cannot change' }).expect(409);
        await mutation(owner, 'delete', `/api/surveys/${f.id}`, { expectedRevision: 2 }).expect(409);
        expect((await pool.query('SELECT "studentId" FROM "SurveyEligibility" WHERE "surveyId"=$1 ORDER BY "studentId"', [f.id])).rows.map(r => r.studentId)).toEqual([fixtureId(11), fixtureId(12)]);
        expect((await owner.agent.get(`/api/surveys/${f.id}`).expect(200)).body.data.title).toBe('Issue 22 integration');
    } finally {
        await pool.query('DELETE FROM "Membership" WHERE "sectionId"=$1 AND "studentId"=$2', [fixtureId(201), fixtureId(13)]);
        await pool.query('INSERT INTO "Membership" ("sectionId","studentId") VALUES ($1,$2)', [fixtureId(201), fixtureId(12)]);
    }
});
it('INT22-03: optional omissions produce real answered denominators, zero bins and null means without leaking identities', async () => {
    const owner = await login(), a = await login('respondent.11@example.test'), b = await login('respondent.12@example.test');
    const optional = (prompt: string, type = 'RATING') => ({ id: null, prompt, type, required: false, ratingScale: type === 'RATING' ? { min: 1, max: 5, minLabel: 'Low', maxLabel: 'High', interpretation: 'Optional scale' } : null });
    const f = await integrationDraft(owner, [optional('Optional rating'), optional('Unanswered rating'), optional('Comments', 'TEXT')]);
    await mutation(owner, 'post', `/api/surveys/${f.id}/publish`, { expectedRevision: 2 }).expect(200);
    const [required, optionalRating, , text] = f.questions;
    const ownFlag = async (client: typeof a) => (await client.agent.get('/api/surveys?limit=100').expect(200)).body.data.items.find((s: { id: string }) => s.id === f.id).participation.submitted;
    expect(await ownFlag(a)).toBe(false); expect(await ownFlag(b)).toBe(false);
    const aBody = { answers: [{ questionId: text!.id, value: 'Synthetic comment A' }, { questionId: optionalRating!.id, value: 5 }, { questionId: required!.id, value: 1 }] };
    await mutation(a, 'post', `/api/surveys/${f.id}/responses`, aBody).expect(201);
    expect(await ownFlag(a)).toBe(true); expect(await ownFlag(b)).toBe(false);
    expect((await a.agent.get(`/api/surveys/${f.id}/my-submission`).expect(200)).body.data.answers.map((r: { questionId: string }) => r.questionId)).toEqual([required!.id, optionalRating!.id, text!.id]);
    await mutation(b, 'post', `/api/surveys/${f.id}/responses`, { answers: [{ questionId: required!.id, value: 5 }, { questionId: text!.id, value: ' \n ' }] }).expect(201);
    expect(await responseRows(f.id)).toEqual({ participation: 2, bundles: 2, answers: 4 });
    const live = await owner.agent.get(`/api/surveys/${f.id}/results`).expect(200);
    expect(Object.keys(live.body.data).sort()).toEqual(['responseCount', 'survey']);
    expect(live.body.data.responseCount).toBe(2);
    await mutation(owner, 'post', `/api/surveys/${f.id}/close`, {}).expect(200);
    const result = await owner.agent.get(`/api/surveys/${f.id}/results`).expect(200);
    expect(result.headers['cache-control']).toBe('private, no-store');
    const qs = result.body.data.questions;
    expect(qs[0]).toMatchObject({ answeredCount: 2, mean: '3.00', ratingScale: { minLabel: 'Slow', maxLabel: 'Fast', interpretation: 'Speed, not quality' } });
    expect(qs[0].distribution.map((r: { count: number }) => r.count)).toEqual([1, 0, 0, 0, 1]);
    expect(qs[1]).toMatchObject({ answeredCount: 1, mean: '5.00' });
    expect(qs[2]).toMatchObject({ answeredCount: 0, mean: null });
    expect(qs[2].distribution.map((r: { count: number }) => r.count)).toEqual([0, 0, 0, 0, 0]);
    expect(qs[3].comments).toEqual(['Synthetic comment A']);
    for (const marker of [fixtureId(11), fixtureId(12), 'identifiedStudentId', 'bundleId', 'submittedAt', 'passwordHash', 'csrfToken']) expect(JSON.stringify(result.body)).not.toContain(marker);
    await mutation(a, 'post', `/api/surveys/${f.id}/responses`, aBody).expect(409);
    expect(await responseRows(f.id)).toEqual({ participation: 2, bundles: 2, answers: 4 });
});
it('INT22-04: faults after each response write stage roll back all rows and permit one valid retry', async () => {
    const owner = await login(), student = await login('respondent.11@example.test');
    for (const table of ['Participation', 'ResponseBundle', 'Answer']) {
        const f = await integrationDraft(owner);
        await mutation(owner, 'post', `/api/surveys/${f.id}/publish`, { expectedRevision: 2 }).expect(200);
        // Fixed test-owned identifier list; no production fault endpoint or interpolated user input.
        await pool.query(`CREATE FUNCTION int22_fail() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic integration fault'; END $$; CREATE TRIGGER int22_fail AFTER INSERT ON "${table}" FOR EACH ROW EXECUTE FUNCTION int22_fail()`);
        const payload = { answers: [{ questionId: f.questions[0]!.id, value: 3 }] };
        try {
            const response = await mutation(student, 'post', `/api/surveys/${f.id}/responses`, payload).expect(500);
            expect(response.body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Request could not be completed.' } });
        } finally { await pool.query(`DROP TRIGGER int22_fail ON "${table}"; DROP FUNCTION int22_fail()`); }
        expect(await responseRows(f.id)).toEqual({ participation: 0, bundles: 0, answers: 0 });
        expect((await student.agent.get(`/api/surveys/${f.id}/my-submission`).expect(200)).body.data.submitted).toBe(false);
        await mutation(student, 'post', `/api/surveys/${f.id}/responses`, payload).expect(201);
        await mutation(student, 'post', `/api/surveys/${f.id}/responses`, payload).expect(409);
        expect(await responseRows(f.id)).toEqual({ participation: 1, bundles: 1, answers: 1 });
    }
});
it('INT22-05: real UTF-8 and surrogate-escaped text enforce code-point boundaries before persistence', async () => {
    const owner = await login();
    for (const escaped of [false, true]) {
        const student = await login('respondent.11@example.test');
        const f = await integrationDraft(owner, [{ id: null, prompt: 'Text', type: 'TEXT', required: false, ratingScale: null }]);
        await mutation(owner, 'post', `/api/surveys/${f.id}/publish`, { expectedRevision: 2 }).expect(200);
        const encode = (text: string) => {
            const json = JSON.stringify({ answers: [{ questionId: f.questions[0]!.id, value: 1 }, { questionId: f.questions[1]!.id, value: text }] });
            return escaped ? json.replace(/[\u007f-\uffff]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`) : json;
        };
        const post = (raw: string) => student.agent.post(`/api/surveys/${f.id}/responses`).set('Origin', origin).set('X-CSRF-Token', student.token).set('Content-Type', 'application/json').send(raw);
        for (const invalid of ['😀'.repeat(2001), '\ud800', '\0']) {
            expect((await post(encode(invalid)).expect(422)).body.error.code).toBe('INVALID_ANSWERS');
            expect(await responseRows(f.id)).toEqual({ participation: 0, bundles: 0, answers: 0 });
        }
        const valid = ' 😀'.repeat(999) + '😀\n'; // Exactly 2,000 code points, retain leading whitespace/newline.
        expect([...valid].length).toBe(2000);
        await post(encode(valid)).expect(201);
        expect((await student.agent.get(`/api/surveys/${f.id}/my-submission`).expect(200)).body.data.answers[1].value).toBe(valid);
    }
});
it('INT22-06: role, same-Course foreign ownership and actor spoofing never expose or mutate response data', async () => {
    const owner = await login(), foreign = await login('owner.2@example.test'), a = await login('respondent.11@example.test'), b = await login('respondent.12@example.test');
    const f = await integrationDraft(owner);
    for (const method of ['get', 'patch', 'delete'] as const) {
        if (method === 'get') await foreign.agent.get(`/api/surveys/${f.id}`).expect(404);
        else await mutation(foreign, method, `/api/surveys/${f.id}`, method === 'patch' ? f.body : { expectedRevision: 2 }).expect(404);
    }
    await mutation(foreign, 'post', `/api/surveys/${f.id}/publish`, { expectedRevision: 2 }).expect(404);
    await mutation(a, 'patch', `/api/surveys/${f.id}`, f.body).expect(403);
    await mutation(owner, 'post', `/api/surveys/${f.id}/publish`, { expectedRevision: 2 }).expect(200);
    await mutation(owner, 'post', `/api/surveys/${f.id}/responses`, { answers: [{ questionId: f.questions[0]!.id, value: 4 }] }).expect(403);
    await a.agent.post(`/api/surveys/${f.id}/responses`).set('Origin', origin).send({ answers: [] }).expect(403);
    await request(app).get(`/api/surveys/${f.id}/my-submission`).expect(401);
    for (const [client, value] of [[a, 1], [b, 5]] as const) await mutation(client, 'post', `/api/surveys/${f.id}/responses`, { answers: [{ questionId: f.questions[0]!.id, value }] }).expect(201);
    const own = await a.agent.get(`/api/surveys/${f.id}/my-submission`).set('X-User-Id', fixtureId(12)).set('X-Role', 'OWNER').expect(200);
    expect(own.body.data.answers).toEqual([{ questionId: f.questions[0]!.id, value: 1 }]);
    expect(Object.keys(own.body.data).sort()).toEqual(['answers', 'submitted', 'surveyId']);
    expect(Object.keys(own.body.data.answers[0]).sort()).toEqual(['questionId', 'value']);
    await a.agent.get(`/api/surveys/${f.id}/my-submission?studentId=${fixtureId(12)}`).expect(422);
    await owner.agent.get(`/api/surveys/${f.id}/my-submission`).expect(403);
    await a.agent.get(`/api/surveys/${f.id}/results`).expect(403);
    await foreign.agent.get(`/api/surveys/${f.id}/results`).expect(404);
    await mutation(foreign, 'post', `/api/surveys/${f.id}/close`, {}).expect(404);
    expect(await responseRows(f.id)).toEqual({ participation: 2, bundles: 2, answers: 2 });
});
it('INT22-07: exact chunked transport ceiling is accepted; oversized, compressed and malformed bodies never write', async () => {
    const owner = await login(), student = await login('respondent.11@example.test');
    const f = await integrationDraft(owner);
    await mutation(owner, 'post', `/api/surveys/${f.id}/publish`, { expectedRevision: 2 }).expect(200);
    const raw = JSON.stringify({ answers: [{ questionId: f.questions[0]!.id, value: 1 }] });
    const server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    if (!address || typeof address === 'string') throw Error('Test HTTP listener missing');
    const cookie = String(student.logged.headers['set-cookie']![0]).split(';')[0]!;
    const send = (body: string, headers: Record<string, string> = {}) => new Promise<{ status: number; body: any }>((resolve, reject) => {
        // No Content-Length: two writes exercise the actual chunked HTTP reader.
        const req = httpRequest({ host: '127.0.0.1', port: address.port, path: `/api/surveys/${f.id}/responses`, method: 'POST', headers: { Origin: origin, Cookie: cookie, 'X-CSRF-Token': student.token, 'Content-Type': 'application/json', ...headers } }, res => {
            let text = ''; res.setEncoding('utf8'); res.on('data', chunk => { text += chunk; }); res.on('end', () => { try { resolve({ status: res.statusCode!, body: JSON.parse(text) }); } catch (e) { reject(e); } });
        });
        req.on('error', reject); req.write(body.slice(0, 100)); req.end(body.slice(100));
    });
    try {
        for (const [body, headers, status, code] of [
            [raw.padEnd(262145, ' '), {}, 413, 'BODY_TOO_LARGE'],
            [raw, { 'Content-Encoding': 'gzip' }, 415, 'UNSUPPORTED_CONTENT'],
            ['{', {}, 400, 'MALFORMED_JSON']
        ] as const) {
            const response = await send(body, headers);
            expect(response.status).toBe(status); expect(response.body.error.code).toBe(code);
            expect(await responseRows(f.id)).toEqual({ participation: 0, bundles: 0, answers: 0 });
        }
        expect((await send(raw.padEnd(262144, ' '))).status).toBe(201);
        expect(await responseRows(f.id)).toEqual({ participation: 1, bundles: 1, answers: 1 });
    } finally { await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve())); }
});
it('INT22-08: a real held Survey lock returns safe timeout with zero rows, then a deliberate retry succeeds', async () => {
    const owner = await login(), student = await login('respondent.11@example.test');
    const f = await integrationDraft(owner);
    await mutation(owner, 'post', `/api/surveys/${f.id}/publish`, { expectedRevision: 2 }).expect(200);
    const blocker = await pool.connect();
    const payload = { answers: [{ questionId: f.questions[0]!.id, value: 2 }] };
    try {
        await blocker.query('BEGIN'); await blocker.query('SELECT id FROM "Survey" WHERE id=$1 FOR UPDATE', [f.id]);
        const response = await mutation(student, 'post', `/api/surveys/${f.id}/responses`, payload).expect(503);
        expect(response.body).toEqual({ error: { code: 'SERVICE_UNAVAILABLE', message: 'The service is temporarily unavailable.' } });
        expect(await responseRows(f.id)).toEqual({ participation: 0, bundles: 0, answers: 0 });
    } finally { await blocker.query('ROLLBACK'); blocker.release(); }
    expect((await student.agent.get(`/api/surveys/${f.id}/my-submission`).expect(200)).body.data.submitted).toBe(false);
    await mutation(student, 'post', `/api/surveys/${f.id}/responses`, payload).expect(201);
});
it('INT22-09: inconsistent own participation/bundle fails closed without data, and an empty Closed survey has null results', async () => {
    const owner = await login(), student = await login('respondent.11@example.test');
    const f = await integrationDraft(owner);
    await mutation(owner, 'post', `/api/surveys/${f.id}/publish`, { expectedRevision: 2 }).expect(200);
    await pool.query('INSERT INTO "Participation" ("surveyId","studentId") VALUES ($1,$2)', [f.id, fixtureId(11)]);
    try {
        const result = await student.agent.get(`/api/surveys/${f.id}/my-submission`).expect(500);
        expect(Object.keys(result.body)).toEqual(['error']);
        expect(JSON.stringify(result.body)).not.toContain(fixtureId(11));
    } finally { await pool.query('DELETE FROM "Participation" WHERE "surveyId"=$1', [f.id]); }
    await mutation(owner, 'post', `/api/surveys/${f.id}/close`, {}).expect(200);
    const result = (await owner.agent.get(`/api/surveys/${f.id}/results`).expect(200)).body.data;
    expect(result.responseCount).toBe(0);
    expect(result.questions[0]).toMatchObject({ answeredCount: 0, mean: null });
    expect(result.questions[0].distribution.map((b: { count: number }) => b.count)).toEqual([0, 0, 0, 0, 0]);
});
it('INT22-10: held-row barriers exercise both Draft save/publication orders with complete frozen revisions', async () => {
    const owner = await login();
    for (const editFirst of [true, false]) {
        const f = await integrationDraft(owner);
        const blocker = await pool.connect();
        try {
            await blocker.query('BEGIN'); await blocker.query('SELECT id FROM "Survey" WHERE id=$1 FOR UPDATE', [f.id]);
            const edit = () => mutation(owner, 'patch', `/api/surveys/${f.id}`, { ...f.body, title: 'Concurrent edited definition' }).then(r => r);
            const publish = () => mutation(owner, 'post', `/api/surveys/${f.id}/publish`, { expectedRevision: 2 }).then(r => r);
            const first = editFirst ? edit() : publish(); await waitingConnections(1);
            const second = editFirst ? publish() : edit(); await waitingConnections(2);
            await blocker.query('COMMIT');
            const [a, b] = await Promise.all([first, second]);
            expect([a.status, b.status]).toEqual([200, 409]);
            expect(b.body.error.code).toBe(editFirst ? 'REVISION_CONFLICT' : 'INVALID_STATE');
            const stored = (await owner.agent.get(`/api/surveys/${f.id}`).expect(200)).body.data;
            expect(stored).toMatchObject(editFirst ? { status: 'DRAFT', definitionRevision: 3, title: 'Concurrent edited definition' } : { status: 'PUBLISHED', definitionRevision: 2, title: 'Issue 22 integration' });
            expect((await pool.query('SELECT count(*)::int AS n FROM "SurveyEligibility" WHERE "surveyId"=$1', [f.id])).rows[0].n).toBe(editFirst ? 0 : 2);
        } finally { await blocker.query('ROLLBACK'); blocker.release(); }
    }
});
it('INT22-11: scoped pagination retains totals/order at default, final and beyond-last pages and rejects malformed bounds', async () => {
    const owner = await login(), foreign = await login('owner.2@example.test');
    // Twenty-five additional persisted Drafts force more than one authorized survey page.
    await pool.query(`WITH lectures AS (INSERT INTO "Lecture" ("sectionId",title,"lectureDate",sequence)
        SELECT $1,'Pagination fixture','2026-11-10',5000+n FROM generate_series(1,25) n RETURNING id)
        INSERT INTO "Survey" ("lectureId","ownerId",title) SELECT id,$2,'Pagination fixture' FROM lectures`, [fixtureId(201), fixtureId(1)]);
    const first = (await owner.agent.get('/api/surveys?limit=20&offset=0').expect(200)).body.data;
    expect(first.pagination.limit).toBe(20); expect(first.items).toHaveLength(20);
    expect(first.items.map((s: { lecture: { sequence: number } }) => s.lecture.sequence)).toEqual(Array.from({ length: 20 }, (_, i) => 5025 - i));
    const next = (await owner.agent.get('/api/surveys?limit=20&offset=20').expect(200)).body.data;
    expect(next.pagination.total).toBe(first.pagination.total);
    expect(next.items.slice(0, 5).map((s: { lecture: { sequence: number } }) => s.lecture.sequence)).toEqual([5005, 5004, 5003, 5002, 5001]);
    expect(new Set([...first.items, ...next.items].map(s => s.id)).size).toBe(first.items.length + next.items.length);
    const beyond = (await owner.agent.get('/api/surveys?limit=100&offset=10000').expect(200)).body.data;
    expect(beyond.items).toEqual([]); expect(beyond.pagination.total).toBe(first.pagination.total);
    const other = (await foreign.agent.get('/api/surveys').expect(200)).body.data;
    expect(other.items.some((s: { title: string }) => s.title === 'Pagination fixture')).toBe(false);
    for (const query of ['limit=0', 'limit=101', 'limit=', 'offset=-1', 'offset=10001', 'offset=01', 'limit=1&limit=2', 'unknown=x']) {
        expect((await owner.agent.get(`/api/surveys?${query}`).expect(422)).body.error.code).toBe('VALIDATION_FAILED');
    }
});
