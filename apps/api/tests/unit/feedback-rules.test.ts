import { it, expect } from 'vitest';
import { mean, parseAnswers, parseDefinition, validatePublication } from '../../src/feedback-rules.js';
const q = { id: '10000000-0000-4000-8000-000000000001', type: 'TEXT', required: true, position: 1 };
it('F-04 #76 accepts 1,000 raw code points and reports indexed overflow before normalizing blanks', () => {
  const valid = ' ' + '😀'.repeat(998) + '\n';
  const answers = (value: string) => ({ answers: [{ questionId: q.id, value }] });
  expect(parseAnswers(answers(valid), [q])[0]!.value).toBe(valid);
  for (const [value, required] of [[valid + '😀', true], [' '.repeat(1001), false]] as const) {
    expect(() => parseAnswers(answers(value), [{ ...q, required }])).toThrow(expect.objectContaining({
      status: 422, code: 'INVALID_ANSWERS', target: 'answers[0].value',
    }));
  }
  for (const value of ['   ', '\u0000', '\ud800']) {
    expect(() => parseAnswers(answers(value), [q])).toThrow(expect.objectContaining({ code: 'INVALID_ANSWERS' }));
  }
});
it('F-04 #76 accepts 3,000 written code points and rejects 3,001 at form level', () => {
  const questions = Array.from({ length: 6 }, (_, i) => ({
    ...q, id: `10000000-0000-4000-8000-00000000000${i + 1}`, position: i + 1,
    required: i < 5, type: i === 0 ? 'RATING' : 'TEXT',
  }));
  const entries = [4, '😀'.repeat(1000), 'b'.repeat(1000), 'c'.repeat(999), 'd', ' '.repeat(1000)]
    .map((value, i) => ({ questionId: questions[i]!.id, value }));
  expect(parseAnswers({ answers: entries }, questions)).toEqual(entries.slice(0, 5));
  entries[4] = { ...entries[4]!, value: 'dd' };
  expect(() => parseAnswers({ answers: entries }, questions)).toThrow(expect.objectContaining({
    status: 422, code: 'INVALID_ANSWERS', target: '_form',
  }));
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
