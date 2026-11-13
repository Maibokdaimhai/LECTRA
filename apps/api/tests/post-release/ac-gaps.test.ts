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
const options = { testUrl: process.env.TEST_DATABASE_URL, developmentUrl: process.env.DATABASE_URL, allowName: process.env.ALLOW_TEST_DATABASE };
const expected = assertTestDatabase(options);
if (process.env.ALLOW_POST_RELEASE_TESTS !== expected)
  throw new Error('Post-release AC checks require a new empty explicitly opted-in disposable database.');
const pool = new Pool({ connectionString: options.testUrl });
const config = readConfig({ NODE_ENV: 'test', APP_ORIGIN: origin, DATABASE_URL: options.testUrl, SESSION_SECRET: randomBytes(32).toString('base64url') });
let app: Express, sequence = 46000;

beforeAll(async () => {
  expect((await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public'")).rowCount).toBe(0);
  execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { env: { ...process.env, DATABASE_URL: options.testUrl }, stdio: 'pipe' });
  await seedSyntheticDatabase({ ...options, seedName: expected, ownerPassword: password, respondentPassword: password });
  expect((await pool.query(`SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_type.oid=enumtypid WHERE typname='SurveyMode' ORDER BY enumsortorder`)).rows.map(r => r.enumlabel)).toEqual(['IDENTIFIED']);
  // Only this NEW disposable database is widened to construct the exact ANONYMOUS
  // fixture named in F-05 section 3 / TEST-F05-I02 and F-04 TEST-F04-I10.
  // Autocommit before use; never a repository migration or enabled anonymous feature.
  await pool.query(`ALTER TYPE "SurveyMode" ADD VALUE 'ANONYMOUS'`);
});
beforeEach(() => { app = createApp(config); });
afterEach(async () => { await app.locals.close(); });
afterAll(async () => { await pool.end(); });

async function login(email = 'owner.1@example.test') {
  const agent = request.agent(app), boot = await agent.get('/api/auth/session').expect(200);
  const logged = await agent.post('/api/auth/login').set('Origin', origin).set('X-CSRF-Token', boot.body.data.csrfToken).send({ email, password }).expect(200);
  return { agent, token: logged.body.data.csrfToken as string };
}
type Client = Awaited<ReturnType<typeof login>>;
const mutate = (client: Client, path: string, body: object, method: 'post' | 'patch' = 'post') => client.agent[method](path).set('Origin', origin).set('X-CSRF-Token', client.token).send(body);
async function draft(owner: Client) {
  const lecture = (await pool.query('INSERT INTO "Lecture" ("sectionId",title,"lectureDate",sequence) VALUES ($1,\'Post-release AC fixture\',\'2026-11-13\',$2) RETURNING id', [fixtureId(201), ++sequence])).rows[0].id;
  const d = (await mutate(owner, '/api/surveys', { lectureId: lecture }).expect(201)).body.data;
  return (await mutate(owner, `/api/surveys/${d.id}`, { expectedRevision: 1, title: 'Post-release mode checks', questions: [
    { id: null, type: 'RATING', prompt: 'Clarity', required: true, ratingScale: { min: 1, max: 5, minLabel: 'Low', maxLabel: 'High', interpretation: 'Higher means clearer' } },
    { id: null, type: 'TEXT', prompt: 'Suggestion', required: false, ratingScale: null }
  ] }, 'patch').expect(200)).body.data;
}
async function published(owner: Client) {
  const d = await draft(owner);
  return (await mutate(owner, `/api/surveys/${d.id}/publish`, { expectedRevision: d.definitionRevision }).expect(200)).body.data;
}
const sentinel = 'Synthetic unsupported-mode readback sentinel';
const payload = (d: any) => ({ answers: [{ questionId: d.questions[0].id, value: 4 }, { questionId: d.questions[1].id, value: sentinel }] });
async function mode(id: string, value: 'IDENTIFIED' | 'ANONYMOUS') {
  expect((await pool.query('UPDATE "Survey" SET mode=$2::"SurveyMode" WHERE id=$1 RETURNING mode', [id, value])).rows[0].mode).toBe(value);
}
async function persisted(id: string) {
  return (await pool.query(`SELECT
    (SELECT coalesce(jsonb_agg(to_jsonb(p) ORDER BY "studentId"),'[]'::jsonb) FROM "Participation" p WHERE "surveyId"=$1) AS participation,
    (SELECT coalesce(jsonb_agg(to_jsonb(b) ORDER BY id),'[]'::jsonb) FROM "ResponseBundle" b WHERE "surveyId"=$1) AS bundles,
    (SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY "bundleId","questionId"),'[]'::jsonb) FROM "Answer" a WHERE "surveyId"=$1) AS answers`, [id])).rows[0];
}
function denial(response: request.Response, code: string, status = 409) {
  expect(response.status).toBe(status);
  expect(response.body).toEqual({ error: { code, message: 'Request could not be completed.' } });
  expect(response.headers['cache-control']).toContain('no-store');
  expect(JSON.stringify(response.body)).not.toContain(sentinel);
}

it('PR46-I01 / AC-F04-22 / TEST-F04-I10: ANONYMOUS duplicate POST rejects mode before duplicate without writes', async () => {
  const owner = await login(), student = await login('respondent.11@example.test'), other = await login('respondent.12@example.test');
  const d = await published(owner), body = payload(d), path = `/api/surveys/${d.id}/responses`;
  await mutate(student, path, body).expect(201);
  expect((await mutate(student, path, body).expect(409)).body.error.code).toBe('RESPONSE_ALREADY_SUBMITTED');
  const before = await persisted(d.id);
  expect(before.participation).toHaveLength(1); expect(before.bundles).toHaveLength(1); expect(before.answers).toHaveLength(2);
  await mode(d.id, 'ANONYMOUS');
  try {
    denial(await mutate(student, path, body), 'MODE_NOT_SUPPORTED');
    denial(await mutate(other, path, body), 'MODE_NOT_SUPPORTED');
    expect(await persisted(d.id)).toEqual(before);
  } finally { await mode(d.id, 'IDENTIFIED'); }
});

it('PR46-I02 / AC-F05-01 / TEST-F05-I02: own Draft results reject state before mode without statistics or mutation', async () => {
  const owner = await login(), foreign = await login('owner.2@example.test'), student = await login('respondent.11@example.test');
  const d = await draft(owner), path = `/api/surveys/${d.id}/results`;
  const before = (await pool.query('SELECT to_jsonb(s) AS row FROM "Survey" s WHERE id=$1', [d.id])).rows[0].row;
  denial(await owner.agent.get(path), 'RESULTS_NOT_AVAILABLE');
  expect((await pool.query('SELECT to_jsonb(s) AS row FROM "Survey" s WHERE id=$1', [d.id])).rows[0].row).toEqual(before);
  await mode(d.id, 'ANONYMOUS');
  try {
    denial(await owner.agent.get(path), 'RESULTS_NOT_AVAILABLE');
    denial(await foreign.agent.get(path), 'NOT_FOUND', 404);
    denial(await student.agent.get(path), 'FORBIDDEN_ROLE', 403);
    expect(await persisted(d.id)).toEqual({ participation: [], bundles: [], answers: [] });
  } finally { await mode(d.id, 'IDENTIFIED'); }
});

it('PR46-I03 / AC-F05-21 / TEST-F05-I02: own ANONYMOUS Published and Closed results reject without count or text fallback', async () => {
  const owner = await login(), student = await login('respondent.11@example.test'), d = await published(owner);
  await mutate(student, `/api/surveys/${d.id}/responses`, payload(d)).expect(201);
  const before = await persisted(d.id), path = `/api/surveys/${d.id}/results`;
  expect(Object.keys((await owner.agent.get(path).expect(200)).body.data).sort()).toEqual(['responseCount', 'survey']);
  for (const state of ['PUBLISHED', 'CLOSED']) {
    if (state === 'CLOSED') await mutate(owner, `/api/surveys/${d.id}/close`, {}).expect(200);
    await mode(d.id, 'ANONYMOUS');
    try {
      denial(await owner.agent.get(path), 'MODE_NOT_SUPPORTED');
      expect(await persisted(d.id)).toEqual(before);
    } finally { await mode(d.id, 'IDENTIFIED'); }
  }
  const normal = (await owner.agent.get(path).expect(200)).body.data;
  expect(normal.responseCount).toBe(1); expect(normal.questions[1].comments).toEqual([sentinel]);
});

it.each(['PUBLISHED', 'CLOSED'] as const)('PR46-I04-%s / AC-F04-22 / TEST-F04-I10: ANONYMOUS own readback rejects without identified-answer fallback', async state => {
  const owner = await login(), student = await login('respondent.11@example.test'), other = await login('respondent.12@example.test'), ineligible = await login('respondent.13@example.test'), d = await published(owner);
  await mutate(student, `/api/surveys/${d.id}/responses`, payload(d)).expect(201);
  if (state === 'CLOSED') await mutate(owner, `/api/surveys/${d.id}/close`, {}).expect(200);
  const before = await persisted(d.id); await mode(d.id, 'ANONYMOUS');
  try {
    const response = await student.agent.get(`/api/surveys/${d.id}/my-submission`);
    expect.soft(response.status).toBe(409);
    expect.soft(response.body.error?.code).toBe('MODE_NOT_SUPPORTED');
    expect.soft(Object.keys(response.body)).toEqual(['error']);
    expect.soft(JSON.stringify(response.body).includes(sentinel)).toBe(false);
    denial(await other.agent.get(`/api/surveys/${d.id}/my-submission`), 'MODE_NOT_SUPPORTED');
    denial(await ineligible.agent.get(`/api/surveys/${d.id}/my-submission`), 'NOT_FOUND', 404);
    denial(await owner.agent.get(`/api/surveys/${d.id}/my-submission`), 'FORBIDDEN_ROLE', 403);
    expect(await persisted(d.id)).toEqual(before);
  } finally { await mode(d.id, 'IDENTIFIED'); }
});
