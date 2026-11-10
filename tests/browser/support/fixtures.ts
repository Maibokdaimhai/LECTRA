import { createHash } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { assertTestDatabase } from '../../../apps/api/src/test-database.js';
import { fixtureId } from '../../../prisma/fixtures.js';

export function browserDatabase() {
  const name = assertTestDatabase({ testUrl: process.env.TEST_DATABASE_URL, developmentUrl: process.env.DEVELOPMENT_DATABASE_URL, allowName: process.env.ALLOW_TEST_DATABASE });
  if (process.env.NODE_ENV !== 'test' || process.env.ALLOW_BROWSER_TESTS !== name || process.env.DATABASE_URL !== process.env.TEST_DATABASE_URL)
    throw new Error('Issue 23 requires aligned, explicitly opted-in disposable browser storage.');
  return name;
}

async function withDatabase<T>(action: (db: PoolClient) => Promise<T>) {
  const expected = browserDatabase(); // Before constructing or connecting a test-side pool.
  const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL, options: '-c timezone=UTC', connectionTimeoutMillis: 3000 });
  try {
    const db = await pool.connect();
    try {
      if ((await db.query('SELECT current_database() AS name')).rows[0].name !== expected) throw new Error('Unexpected browser database.');
      return await action(db);
    } finally { db.release(); }
  } finally { await pool.end(); }
}

export type LectureFixture = { id: string; title: string; courseCode: string; sectionCode: string };
export class ScenarioData {
  private lectures: string[] = [];
  constructor(private key: string) {}
  async lecture(otherCourse = false): Promise<LectureFixture> {
    const hash = createHash('sha256').update(`${this.key}:${this.lectures.length}`).digest('hex');
    const id = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
    const title = `Issue23 ${hash.slice(0, 12)}`;
    await withDatabase(async db => {
      await db.query('INSERT INTO "Lecture" (id,"sectionId",title,"lectureDate",sequence) VALUES ($1,$2,$3,\'2026-11-10\',$4)',
        [id, fixtureId(otherCourse ? 203 : 201), title, 10000 + parseInt(hash.slice(0, 7), 16)]);
    });
    this.lectures.push(id);
    return { id, title, courseCode: otherCourse ? 'SYN-CPE335' : 'SYN-CPE334', sectionCode: otherCourse ? 'EMPTY' : 'A' };
  }
  async responseRows(surveyId: string) {
    return withDatabase(async db => (await db.query(`SELECT
      (SELECT count(*)::int FROM "Participation" WHERE "surveyId"=$1) AS participation,
      (SELECT count(*)::int FROM "ResponseBundle" WHERE "surveyId"=$1) AS bundles,
      (SELECT count(*)::int FROM "Answer" WHERE "surveyId"=$1) AS answers`, [surveyId])).rows[0]);
  }
  async cleanup() {
    if (!this.lectures.length) return;
    await withDatabase(async db => {
      await db.query('BEGIN');
      try {
        const surveys = (await db.query('SELECT id FROM "Survey" WHERE "lectureId"=ANY($1::uuid[])', [this.lectures])).rows.map(r => r.id);
        for (const table of ['Answer', 'ResponseBundle', 'Participation', 'SurveyEligibility', 'Question'])
          await db.query(`DELETE FROM "${table}" WHERE "surveyId"=ANY($1::uuid[])`, [surveys]);
        await db.query('DELETE FROM "Survey" WHERE id=ANY($1::uuid[])', [surveys]);
        await db.query('DELETE FROM "Lecture" WHERE id=ANY($1::uuid[])', [this.lectures]);
        await db.query('COMMIT');
      } catch (error) { await db.query('ROLLBACK'); throw error; }
    });
  }
}
