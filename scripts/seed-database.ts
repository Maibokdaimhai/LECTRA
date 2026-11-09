import { Pool, type PoolClient } from 'pg';
import argon2 from 'argon2';
import { isDeepStrictEqual } from 'node:util';
import { fixtures } from '../prisma/fixtures.js';
import { assertTestDatabase } from '../apps/api/src/test-database.js';

type Options = { testUrl?: string; developmentUrl?: string; allowName?: string; seedName?: string; ownerPassword?: string; respondentPassword?: string };
type Row = Record<string, string | number | boolean | undefined>;
const tableKeys = {
  User: ['id'], Course: ['id'], Section: ['id'], Membership: ['sectionId', 'studentId'], Lecture: ['id'], Survey: ['id'], Question: ['id']
} as const;
type Table = keyof typeof tableKeys;

function password(value: string | undefined) {
  if (!value || [...value].length < 12 || [...value].length > 128 || value.includes('\0')) throw new Error('Synthetic seed passwords must be supplied through the environment (12–128 code points).');
  return value;
}

async function insertOrVerify(client: PoolClient, table: Table, row: Row, userPassword?: string) {
  // Identifiers are only the hardcoded fixture objects/table allowlist, never request input.
  const keys: readonly string[] = tableKeys[table];
  const where = keys.map((k, i) => `"${k}" = $${i + 1}`).join(' AND ');
  const found = await client.query<{ row: Record<string, unknown> }>(`SELECT to_jsonb(t) AS row FROM "${table}" t WHERE ${where}`, keys.map(k => row[k]));
  const existing = found.rows[0]?.row;
  if (existing) {
    for (const [key, value] of Object.entries(row)) {
      if (key !== 'passwordHash' && !isDeepStrictEqual(existing[key], value)) throw new Error('Seed refused: an existing fixture differs; nothing was overwritten.');
    }
    if (userPassword && !(await argon2.verify(String(existing.passwordHash), userPassword))) throw new Error('Seed refused: existing account password differs; nothing was overwritten.');
    return;
  }
  const columns = Object.keys(row);
  await client.query(`INSERT INTO "${table}" (${columns.map(k => `"${k}"`).join(',')}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(',')})`, columns.map(k => row[k]));
}

export async function seedSyntheticDatabase(options: Options) {
  const expected = assertTestDatabase(options);
  if (options.seedName !== expected) throw new Error('Synthetic seed requires explicit SEED_SYNTHETIC_DATA matching the disposable test database.');
  const ownerPassword = password(options.ownerPassword);
  const respondentPassword = password(options.respondentPassword);
  const pool = new Pool({ connectionString: options.testUrl!, options: '-c timezone=UTC', connectionTimeoutMillis: 3000 });
  try {
    const client = await pool.connect();
    try {
      if ((await client.query<{ name: string }>('SELECT current_database() AS name')).rows[0]?.name !== expected) throw new Error('Unexpected seed database.');
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(334, 16)');
      for (const user of [...fixtures.owners, ...fixtures.respondents]) {
        const input = user.role === 'OWNER' ? ownerPassword : respondentPassword;
        // New salts for new rows; existing hashes are retained and verified, never replaced.
        const hash = await argon2.hash(input, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1, hashLength: 32 });
        await insertOrVerify(client, 'User', { ...user, passwordHash: hash }, input);
      }
      for (const row of fixtures.courses) await insertOrVerify(client, 'Course', row);
      for (const row of fixtures.sections) {
        if (!fixtures.owners.some(u => u.id === row.ownerId)) throw new Error('Invalid synthetic Section owner.');
        await insertOrVerify(client, 'Section', row);
      }
      for (const row of fixtures.memberships) {
        if (!fixtures.respondents.some(u => u.id === row.studentId)) throw new Error('Invalid synthetic Membership role.');
        await insertOrVerify(client, 'Membership', row);
      }
      for (const row of fixtures.lectures) await insertOrVerify(client, 'Lecture', row);
      const lecture = fixtures.lectures.find(l => l.id === fixtures.survey.lectureId)!;
      if (!fixtures.sections.some(s => s.id === lecture.sectionId && s.ownerId === fixtures.survey.ownerId)) throw new Error('Invalid synthetic Survey owner.');
      await insertOrVerify(client, 'Survey', fixtures.survey);
      for (const row of fixtures.questions) await insertOrVerify(client, 'Question', row);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  } finally { await pool.end(); }
}
