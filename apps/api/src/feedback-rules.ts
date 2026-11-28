import { z } from 'zod';
import { fail } from './http.js';
const id = z.string().regex(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
const wellFormed = (s: string) => !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(s);
const text = (max: number) => z.string().transform(s => s.trim()).refine(s => !s.includes('\0') && wellFormed(s) && [...s].length <= max);
const ratingScale = z.object({ min: z.literal(1), max: z.literal(5), minLabel: text(120), maxLabel: text(120), interpretation: text(500) }).strict();
const choiceOption = z.object({ id: id.nullable(), label: text(120) }).strict();
const question = z.object({
    id: id.nullable(),
    prompt: text(500),
    type: z.enum(['RATING', 'TEXT', 'SINGLE_CHOICE']),
    required: z.boolean(),
    ratingScale: ratingScale.nullable(),
    options: z.array(choiceOption).min(2).max(6).optional(),
}).strict().refine(q => {
    if ((q.type === 'RATING') !== (q.ratingScale !== null))
        return false;
    if (q.type !== 'SINGLE_CHOICE')
        return q.options === undefined;
    if (!q.options?.every(option => option.label.length > 0))
        return false;
    const labels = q.options.map(option => option.label.toLowerCase());
    const ids = q.options.flatMap(option => option.id ? [option.id] : []);
    return new Set(labels).size === labels.length && new Set(ids).size === ids.length;
});
const definition = z.object({ expectedRevision: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), title: text(120), mode: z.enum(['IDENTIFIED', 'ANONYMOUS']).optional(), questions: z.array(question).max(10) }).strict();
export function parseDefinition(value: unknown) {
    const parsed = definition.safeParse(value);
    if (!parsed.success)
        fail(422, 'INVALID_DEFINITION');
    const data = parsed.data!;
    const ids = data.questions.flatMap(q => q.id ? [q.id] : []);
    if (new Set(ids).size !== ids.length)
        fail(422, 'INVALID_DEFINITION');
    return data;
}
export function validatePublication(value: {
    title: string;
    questions: {
        prompt: string;
        type: string;
        options?: { label: string }[];
        ratingScale: {
            minLabel: string;
            maxLabel: string;
            interpretation: string;
        } | null;
    }[];
}) {
    if (!value.title || !value.questions.length || !value.questions.some(q => q.type === 'RATING' || q.type === 'SINGLE_CHOICE') || value.questions.some(q => !q.prompt || (q.type === 'RATING' && (!q.ratingScale?.minLabel || !q.ratingScale.maxLabel || !q.ratingScale.interpretation))
        || (q.type === 'SINGLE_CHOICE' && (!q.options || q.options.length < 2 || q.options.length > 6
            || q.options.some(option => !option.label.trim())
            || new Set(q.options.map(option => option.label.trim().toLowerCase())).size !== q.options.length))))
        fail(422, 'INVALID_DEFINITION');
}
export type StoredQuestion = {
    id: string;
    type: string;
    required: boolean;
    position: number;
    options?: { id: string }[];
};
export function parseAnswerEnvelope(value: unknown) {
    const parsed = z.object({ answers: z.array(z.object({ questionId: id, value: z.union([z.number(), z.string()]) }).strict()).max(10) }).strict().safeParse(value);
    if (!parsed.success) fail(422, 'INVALID_REQUEST');
    return parsed.data!;
}
const writtenAnswerLimit = 1000;
const writtenSubmissionLimit = 3000;

export function parseAnswers(value: unknown, questions: StoredQuestion[]) {
    const entries = parseAnswerEnvelope(value).answers;
    const seen = new Set<string>();
    const answers: {
        questionId: string;
        value: string | number;
    }[] = [];
    let writtenTotal = 0;
    for (const [index, entry] of entries.entries()) {
        const q = questions.find(q => q.id === entry.questionId);
        if (!q || seen.has(entry.questionId))
            fail(422, 'INVALID_ANSWERS');
        seen.add(entry.questionId);
        if (q!.type === 'RATING') {
            if (typeof entry.value !== 'number' || !Number.isInteger(entry.value) || entry.value < 1 || entry.value > 5)
                fail(422, 'INVALID_ANSWERS');
        }
        else if (q!.type === 'SINGLE_CHOICE') {
            if (typeof entry.value !== 'string' || !q!.options?.some(option => option.id === entry.value))
                fail(422, 'INVALID_ANSWERS', 'Choose an option from this question.', `answers[${index}].value`);
        }
        else {
            const value = entry.value;
            if (typeof value !== 'string' || !wellFormed(value) || value.includes('\0'))
                return fail(422, 'INVALID_ANSWERS');
            const length = [...value].length;
            if (length > writtenAnswerLimit)
                fail(422, 'INVALID_ANSWERS', `Use at most ${writtenAnswerLimit} characters.`, `answers[${index}].value`);
            if (!value.trim()) {
                if (q!.required)
                    fail(422, 'INVALID_ANSWERS');
                continue;
            }
            writtenTotal += length;
        }
        answers.push(entry);
    }
    if (writtenTotal > writtenSubmissionLimit)
        fail(422, 'INVALID_ANSWERS', `Use at most ${writtenSubmissionLimit} characters across written answers.`, '_form');
    if (!answers.length || questions.some(q => q.required && !answers.some(a => a.questionId === q.id)))
        fail(422, 'INVALID_ANSWERS');
    return answers.sort((a, b) => questions.find(q => q.id === a.questionId)!.position - questions.find(q => q.id === b.questionId)!.position);
}
export function mean(scores: number[]) {
    if (!scores.length)
        return null;
    const cents = (BigInt(scores.reduce((a, b) => a + b, 0)) * 100n * 2n + BigInt(scores.length)) / (2n * BigInt(scores.length));
    return `${cents / 100n}.${String(cents % 100n).padStart(2, '0')}`;
}

export function canReleaseAnonymousQuestion(counts: readonly number[]) {
    return counts.reduce((sum, count) => sum + count, 0) >= 5
        && counts.every(count => count === 0 || count >= 3);
}
