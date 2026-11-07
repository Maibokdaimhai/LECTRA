import { describe, expect, it } from 'vitest';
import { assertTestDatabase } from '../../src/test-database.js';
const safe = { testUrl: 'postgresql://fixture@127.0.0.1:5432/lectra_test', developmentUrl: 'postgresql://fixture@127.0.0.1:5432/lectra_dev', allowName: 'lectra_test' };
describe('test database safety before any SQL', () => {
  it('accepts the explicitly opted-in isolated test database', () => { expect(assertTestDatabase(safe)).toBe('lectra_test'); });
  it.each([
    { label: 'development name', input: { ...safe, testUrl: safe.developmentUrl, allowName: 'lectra_dev' } },
    { label: 'same target with different password/options', input: { ...safe, developmentUrl: 'postgres://different:private-marker@127.0.0.1/lectra_test?schema=other' } },
    { label: 'same loopback target through localhost alias', input: { ...safe, developmentUrl: 'postgresql://fixture@localhost/lectra_test' } },
    { label: 'missing opt-in', input: { ...safe, allowName: undefined } },
    { label: 'wrong opt-in', input: { ...safe, allowName: 'lectra_test_other' } },
    { label: 'non-PostgreSQL URL', input: { ...safe, testUrl: 'mysql://fixture@127.0.0.1/lectra_test' } },
    { label: 'missing development reference', input: { ...safe, developmentUrl: undefined } },
    { label: 'encoded extra database path', input: { ...safe, testUrl: 'postgresql://fixture@127.0.0.1/lectra_test%2Fdev' } }
  ])('rejects $label', ({ input }) => { expect(() => assertTestDatabase(input)).toThrow('Unsafe test database configuration'); });
  it('does not disclose either connection string on rejection', () => {
    try { assertTestDatabase({ ...safe, testUrl: 'postgresql://private-marker@127.0.0.1/lectra_dev' }); throw new Error('Expected rejection'); }
    catch (error) { expect(String(error)).toContain('Unsafe test database configuration'); expect(String(error)).not.toContain('private-marker'); }
  });
});
