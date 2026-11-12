import { it, expect } from 'vitest';
import { mean, parseAnswers, parseDefinition, validatePublication } from '../../src/feedback-rules.js';
const q = { id: '10000000-0000-4000-8000-000000000001', type: 'TEXT', required: true, position: 1 };
it('F-04: accepts 2000 Unicode code points, preserves nonblank text, rejects 2001 and malformed Unicode', () => {
  expect(parseAnswers({ answers: [{ questionId: q.id, value: '😀'.repeat(2000) }] }, [q])[0]!.value).toHaveLength(4000);
  for (const value of ['😀'.repeat(2001), '   ', '\u0000', '\ud800']) expect(() => parseAnswers({ answers: [{ questionId: q.id, value }] }, [q])).toThrow();
  expect(parseAnswers({ answers: [{ questionId: q.id, value: ' keep spaces ' }] }, [q])[0]!.value).toBe(' keep spaces ');
});
it('F-03: Draft permits empty definitions while publication requires meaningful rating scales', () => {
  const draft = parseDefinition({ expectedRevision: 1, title: ' ', questions: [] });
  expect(draft.title).toBe(''); expect(() => validatePublication(draft)).toThrow();
  expect(() => parseDefinition({ expectedRevision: 0, title: 'x', questions: [] })).toThrow();
  expect(() => parseDefinition({ expectedRevision: 1, title: '😀'.repeat(121), questions: [] })).toThrow();
});
it('F-05: exact half-up two-decimal means use only actually answered ratings', () => {
  expect(mean([])).toBe(null); expect(mean([1,2,3,4,5,5])).toBe('3.33'); expect(mean([2,4,5])).toBe('3.67');
  expect(mean([1,1,1,1,1,1,1,2])).toBe('1.13'); expect(mean([1,5])).toBe('3.00');
});
