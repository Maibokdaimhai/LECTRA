import { describe, expect, it } from 'vitest';
import { draftFieldIssues, responseFieldIssues, textProblem } from '../src/ui-validation.js';
const rating = { id: 'rating', prompt: 'Understanding', type: 'RATING' as const, required: true, ratingScale: { minLabel: 'Low', maxLabel: 'High', interpretation: 'Higher means clearer' } };
const text = { id: 'text', prompt: 'Comment', type: 'TEXT' as const, required: true, ratingScale: null };
const targets = { title: 'title', add: 'add', question: (i: number, field: string) => `q${i}-${field}` };
describe('safe field validation', () => {
  it('matches Draft Unicode limits after trimming without rejecting valid surrogate pairs', () => {
    expect(textProblem(` ${'😀'.repeat(120)} `, 120, false, true)).toBeUndefined();
    expect(textProblem('😀'.repeat(121), 120)).toBe('Use at most 120 characters.');
    for (const invalid of ['\0', '\uD800', '\uDC00']) expect(textProblem(invalid, 120)).toBe('Remove unsupported characters.');
  });
  it('maps all supported Draft fields and publication completeness to stable targets', () => {
    const issues = draftFieldIssues('x'.repeat(121), [{ ...rating, prompt: 'x'.repeat(501), ratingScale: { minLabel: 'x'.repeat(121), maxLabel: 'x'.repeat(121), interpretation: 'x'.repeat(501) } }], targets);
    expect(issues.map(i => i.target)).toEqual(['title', 'q0-prompt', 'q0-minLabel', 'q0-maxLabel', 'q0-interpretation']);
    expect(draftFieldIssues('', [], targets)).toEqual([]);
    expect(draftFieldIssues('', [], targets, true).map(i => i.target)).toEqual(['title', 'add']);
    expect(draftFieldIssues('Title', [text], targets, true).map(i => i.target)).toEqual(['q0-type']);
  });
  it('validates required, optional, integer and range rating answers', () => {
    for (const value of [undefined, 0, 6, 1.5, '1']) expect(responseFieldIssues([rating], value === undefined ? {} : { rating: value }, () => 'rating-input')).toHaveLength(1);
    expect(responseFieldIssues([rating], { rating: 1 }, () => 'rating-input')).toEqual([]);
    expect(responseFieldIssues([{ ...rating, required: false }, text], { text: 'Comment' }, String)).toEqual([]);
  });
  it('targets #76 aggregate overflow at the total and counts optional blank as zero', () => {
    const questions = ['a', 'b', 'c', 'd', 'blank'].map(id => ({ ...text, id, required: id !== 'blank' }));
    const values = { a: '😀'.repeat(1000), b: 'b'.repeat(1000), c: 'c'.repeat(999), d: 'd', blank: ' '.repeat(1000) };
    expect(responseFieldIssues(questions, values, String)).toEqual([]);
    expect(responseFieldIssues(questions, { ...values, d: 'dd' }, String)).toEqual([
      { target: '_form', message: 'Use at most 3000 characters across written answers.' },
    ]);
  });
  it('checks TEXT raw limits before blank normalization and preserves Unicode boundaries', () => {
    expect(responseFieldIssues([text], { text: '😀'.repeat(1000) }, String)).toEqual([]);
    expect(responseFieldIssues([text], { text: '😀'.repeat(1001) }, String)[0]?.message).toMatch(/^Question 1: Use at most 1000 characters[.]$/);
    expect(responseFieldIssues([{ ...text, required: false }], { text: ' '.repeat(1001) }, String)[0]?.message).toMatch(/^Question 1: Use at most 1000 characters[.]$/);
    expect(responseFieldIssues([text], { text: '  ' }, String)[0]?.message).toContain('nonblank');
    expect(responseFieldIssues([{ ...text, required: false }], {}, String)[0]?.message).toContain('at least one');
    expect(responseFieldIssues([text], { text: '\uD800' }, String)[0]?.message).toContain('unsupported');
  });
});
