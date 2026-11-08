import { beforeAll, afterAll, beforeEach, afterEach, it, expect } from 'vitest';
import request from 'supertest';
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
const password = randomBytes(24).toString('base64url');
const secret = randomBytes(32).toString('base64url');
const options = { testUrl: process.env.TEST_DATABASE_URL, developmentUrl: process.env.DATABASE_URL, allowName: process.env.ALLOW_TEST_DATABASE };
const expected = assertTestDatabase(options);
if (process.env.ALLOW_FEATURE_TESTS !== expected) throw new Error('Feature tests require explicit ALLOW_FEATURE_TESTS and a new empty disposable database.');
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
  const agent = request.agent(app); const boot = await agent.get('/api/auth/session').expect(200);
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
it('TEST-F01-I08/I16/I17: expiry is absolute and logout revokes a replayed cookie', async () => {
  const { agent, token, logged } = await login();
  const saved = String(logged.headers['set-cookie']![0]).split(';')[0]!;
  await agent.post('/api/auth/logout').set('Origin', origin).set('X-CSRF-Token', token).send({}).expect(204);
  await request(app).get('/api/auth/me').set('Cookie', saved).expect(401);
  await request(app).post('/api/auth/logout').set('Cookie', saved).set('Origin', origin).set('X-CSRF-Token', token).send({}).expect(204);
  const next = await login(); clock += 28_800_000;
  const expired = await next.agent.get('/api/auth/me').expect(401);
  expect(expired.body.error.code).toBe('SESSION_EXPIRED');
  await next.agent.get('/api/auth/session').expect(200);
});
it('TEST-F01-I09/I28: trusted role is resolved anew and authenticated login does not switch accounts', async () => {
  const { agent, token } = await login();
  await agent.post('/api/auth/login').set('Origin', origin).set('X-CSRF-Token', token).send({ email: 'owner.2@example.test', password }).expect(409);
  await pool.query('UPDATE "User" SET role=\'RESPONDENT\' WHERE id=$1', [fixtureId(1)]);
  try { expect((await agent.get('/api/auth/me').expect(200)).body.data.user.role).toBe('RESPONDENT'); }
  finally { await pool.query('UPDATE "User" SET role=\'OWNER\' WHERE id=$1', [fixtureId(1)]); }
});
it('TEST-F01-I14/I22: old tokens fail; the eleventh valid-shape login is throttled', async () => {
  const { agent, token, boot } = await login();
  await agent.post('/api/auth/logout').set('Origin', origin).set('X-CSRF-Token', boot.body.data.csrfToken).send({}).expect(403);
  await agent.post('/api/auth/logout').set('Origin', origin).set('X-CSRF-Token', token).send({}).expect(204);
  const newBoot = await agent.get('/api/auth/session').expect(200);
  for (let i = 0; i < 9; i++) await agent.post('/api/auth/login').set('Origin', origin).set('X-CSRF-Token', newBoot.body.data.csrfToken).send({ email: 'missing@example.test', password }).expect(401);
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
  expect(sections.body.data.items.map((s: { id: string }) => s.id)).toEqual([fixtureId(201)]);
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
  [ratingId, textId] = saved.body.data.questions.map((q: { id: string }) => q.id);
  await mutation(owner, 'patch', `/api/surveys/${surveyId}`, body).expect(409);
  const noOp = { ...body, expectedRevision: 2, questions: body.questions.map((q, i) => ({ ...q, id: i ? textId : ratingId })) };
  expect((await mutation(owner, 'patch', `/api/surveys/${surveyId}`, noOp).expect(200)).body.data.definitionRevision).toBe(2);
  const foreign = await login('owner.2@example.test'); await foreign.agent.get(`/api/surveys/${surveyId}`).expect(404);
  await mutation(owner, 'post', `/api/surveys/${surveyId}/publish`, { expectedRevision: 2 }).expect(200);
  expect((await pool.query('SELECT count(*)::int AS n FROM "SurveyEligibility" WHERE "surveyId"=$1', [surveyId])).rows[0].n).toBe(2);
  await mutation(owner, 'patch', `/api/surveys/${surveyId}`, noOp).expect(409);
  const student = await login('respondent.11@example.test');
  const form = await student.agent.get(`/api/surveys/${surveyId}`).expect(200);
  expect(form.body.data.definitionRevision).toBeUndefined(); expect(form.body.data.privacyDisclosure).toContain('identified');
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
  const own = await student.agent.get(`/api/surveys/${surveyId}/my-submission`).expect(200);
  expect(own.body.data.submitted).toBe(true); expect(own.body.data.answers).toEqual(body.answers);
  await student.agent.get(`/api/surveys/${surveyId}/my-submission?studentId=${fixtureId(12)}`).expect(422);
  const owner = await login();
  const live = await owner.agent.get(`/api/surveys/${surveyId}/results`).expect(200);
  expect(live.body.data.responseCount).toBe(1); expect(live.body.data.questions).toBeUndefined();
  await student.agent.get(`/api/surveys/${surveyId}/results`).expect(403);
  await mutation(owner, 'post', `/api/surveys/${surveyId}/close`, {}).expect(200);
  await mutation(student, 'post', `/api/surveys/${surveyId}/responses`, body).expect(409);
  const summary = await owner.agent.get(`/api/surveys/${surveyId}/results`).expect(200);
  expect(summary.body.data.questions[0].mean).toBe('5.00');
  expect(summary.body.data.questions[0].distribution.map((b: { count: number }) => b.count)).toEqual([0,0,0,0,1]);
  expect(summary.body.data.questions[1].comments).toEqual([body.answers[1]!.value]);
  expect(JSON.stringify(summary.body)).not.toContain(fixtureId(11));
  const foreign = await login('owner.2@example.test'); await foreign.agent.get(`/api/surveys/${surveyId}/results`).expect(404);
  await app.locals.close(); app = createApp(config, () => clock);
  const replay = String(student.logged.headers['set-cookie']![0]).split(';')[0]!;
  expect((await request(app).get(`/api/surveys/${surveyId}/my-submission`).set('Cookie', replay).expect(200)).body.data.answers).toEqual(body.answers);
});
