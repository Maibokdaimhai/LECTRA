export type FieldIssue = { target: string; message: string };
type QuestionFields = { id?: string | null; prompt: string; type: 'RATING' | 'TEXT' | 'SINGLE_CHOICE'; options?: { id: string | null; label: string }[]; required: boolean; ratingScale: { minLabel: string; maxLabel: string; interpretation: string } | null };
export type DraftField = 'prompt' | 'type' | 'minLabel' | 'maxLabel' | 'interpretation' | `option-${number}`;

export function textProblem(value: string, max: number, required = false, trim = false): string | undefined {
  const text = trim ? value.trim() : value;
  if (text.includes('\0') || /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(text)) return 'Remove unsupported characters.';
  if ([...text].length > max) return `Use at most ${max} characters.`;
  if (required && !text.trim()) return 'Enter a nonblank value.';
}
export function draftFieldIssues(title: string, questions: readonly QuestionFields[], targets: { title: string; add: string; question: (index: number, field: DraftField) => string }, publishing = false): FieldIssue[] {
  const issues: FieldIssue[] = [];
  const add = (target: string, label: string, problem: string | undefined) => { if (problem) issues.push({ target, message: `${label}: ${problem}` }); };
  add(targets.title, 'Survey title', textProblem(title, 120, publishing, true));
  questions.forEach((q, index) => {
    add(targets.question(index, 'prompt'), `Question ${index + 1} prompt`, textProblem(q.prompt, 500, publishing, true));
    if (q.type === 'SINGLE_CHOICE') {
      const options = q.options ?? [];
      const labels = options.map(option => option.label.trim().toLowerCase());
      if (options.length < 2 || options.length > 6 || new Set(labels).size !== labels.length) {
        issues.push({ target: targets.question(index, 'type'), message: `Question ${index + 1}: Enter 2–6 distinct options.` });
      }
      options.forEach((option, position) => add(targets.question(index, `option-${position}`), `Question ${index + 1} option ${position + 1}`, textProblem(option.label, 120, true, true)));
    }
    if (q.ratingScale) for (const field of ['minLabel', 'maxLabel', 'interpretation'] as const)
      add(targets.question(index, field), `Question ${index + 1} ${field === 'minLabel' ? 'score 1 label' : field === 'maxLabel' ? 'score 5 label' : 'scale interpretation'}`, textProblem(q.ratingScale[field], field === 'interpretation' ? 500 : 120, publishing, true));
  });
  if (publishing && !questions.length) issues.push({ target: targets.add, message: 'Add at least one rating or single-choice question before publishing.' });
  else if (publishing && !questions.some(q => q.type !== 'TEXT')) issues.push({ target: targets.question(0, 'type'), message: 'Include at least one rating or single-choice question before publishing.' });
  return issues;
}
export const writtenAnswerLimit = 1000;
export const writtenSubmissionLimit = 3000;

export function writtenAnswerTotal(questions: readonly QuestionFields[], values: Record<string, string | number>): number {
  return questions.reduce((total, question) => {
    const value = values[question.id ?? ''];
    return question.type === 'TEXT' && typeof value === 'string' && value.trim()
      ? total + [...value].length
      : total;
  }, 0);
}
export function responseFieldIssues(questions: readonly QuestionFields[], values: Record<string, string | number>, target: (index: number) => string, totalTarget = '_form'): FieldIssue[] {
  const issues: FieldIssue[] = [];
  questions.forEach((q, index) => {
    const value = values[q.id ?? ''];
    let problem: string | undefined;
    if (q.type === 'RATING') {
      if ((value === undefined && q.required) || (value !== undefined && (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 5))) problem = 'Choose a rating from 1 to 5.';
    } else if (q.type === 'SINGLE_CHOICE') {
      if ((value === undefined && q.required) || (value !== undefined && !q.options?.some(option => option.id === value)))
        problem = 'Choose an option from this question.';
    } else if (value === undefined) { if (q.required) problem = 'Enter a nonblank answer.'; }
    else problem = typeof value === 'string' ? textProblem(value, writtenAnswerLimit, q.required) : 'Enter a written answer.';
    if (problem) issues.push({ target: target(index), message: `Question ${index + 1}: ${problem}` });
  });
  if (writtenAnswerTotal(questions, values) > writtenSubmissionLimit) {
    issues.push({ target: totalTarget, message: `Use at most ${writtenSubmissionLimit} characters across written answers.` });
  }
  if (!issues.length && questions.length && !Object.values(values).some(v => typeof v === 'number' || v.trim())) issues.push({ target: target(0), message: 'Provide at least one answer before submitting.' });
  return issues;
}
