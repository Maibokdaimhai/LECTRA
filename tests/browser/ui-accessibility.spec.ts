import { test as base, expect, type Page } from '@playwright/test';
import { keyActivate, keyFill, zoomPage, verifyLayout } from './support/ui-keyboard.js';
const test = base.extend({ page: zoomPage });
const scale = { min: 1, max: 5, minLabel: 'Low', maxLabel: 'High', interpretation: 'Higher means clearer' };
const questions = ['First', 'Middle', 'Last'].map((prompt, i) => ({ id: `q${i + 1}`, position: i + 1, prompt, type: 'RATING', required: true, ratingScale: scale }));
async function fixture(page: Page, respondent = false, count = 3, textQuestion = false) {
  let stored = { id: 'survey', lectureId: 'lecture', title: 'Keyboard fixture', status: respondent ? 'PUBLISHED' : 'DRAFT', mode: 'IDENTIFIED', definitionRevision: 1,
    context: { course: { code: 'CPE334' }, section: { sectionCode: 'A' }, lecture: { title: 'Lecture', lectureDate: '2026-11-12' } }, privacyDisclosure: 'Identified fixture.', questions: questions.slice(0, count).map(q => ({ ...q, type: textQuestion ? 'TEXT' : q.type, ratingScale: textQuestion ? null : q.ratingScale })) };
  let patchError = false, response: 'ok' | 'invalid' | 'uncertain' = 'ok', statusUnavailable = false, mutations = 0;
  let submission: { surveyId: string; submitted: boolean; answers: unknown[] | null } = { surveyId: 'survey', submitted: false, answers: null };
  await page.route('**/api/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname;
    const send = (data: unknown, status = 200) => route.fulfill({ status, json: { data } });
    const error = (code: string, status: number) => route.fulfill({ status, json: { error: { code, message: 'PRIVATE_SQL_MARKER must never be displayed' } } });
    if (path === '/api/auth/session') return send({ authenticated: true, user: { id: 'actor', displayName: 'Fixture actor', role: respondent ? 'RESPONDENT' : 'OWNER' }, csrfToken: 'fixture', expiresAt: null });
    if (path === '/api/health') return send({ status: 'ok' });
    if (path === '/api/surveys/survey/my-submission') return statusUnavailable ? error('SERVICE_UNAVAILABLE', 503) : send(submission);
    if (path === '/api/surveys/survey/responses') {
      mutations++;
      if (response === 'invalid') return error('INVALID_ANSWERS', 422);
      if (response === 'uncertain') return route.abort('failed');
      submission = { surveyId: 'survey', submitted: true, answers: req.postDataJSON().answers };
      return send(submission, 201);
    }
    if (path === '/api/surveys/survey') {
      if (req.method() === 'PATCH') {
        mutations++;
        if (patchError) return error('INVALID_DEFINITION', 422);
        stored = { ...stored, ...req.postDataJSON(), definitionRevision: stored.definitionRevision + 1 };
      }
      return send(stored);
    }
    if (path === '/api/courses') return send({ items: [], pagination: { total: 0, limit: 20, offset: 0 } });
    if (path.endsWith('/results')) return send({ responseCount: 0 });
    return send({ items: [stored], pagination: { total: 1, limit: 20, offset: 0 } });
  });
  await page.goto('/');
  await keyActivate(page, page.getByRole('button', { name: 'Open survey', exact: true }));
  return { rejectPatch: () => { patchError = true; }, response: (value: typeof response, unavailable = false) => { response = value; statusUnavailable = unavailable; }, stored: () => stored, mutations: () => mutations };
}

test('UI-F01: keyboard reorder focuses the moved question, including movement to first position', async ({ page }, info) => {
  const f = await fixture(page);
  await expect(page.getByRole('button', { name: 'Move question 1 up', exact: true })).toBeDisabled();
  await keyActivate(page, page.getByRole('button', { name: 'Move question 2 up', exact: true }), 'Space');
  await expect(page.getByLabel('Prompt', { exact: true }).nth(0)).toBeFocused();
  await expect(page.getByLabel('Prompt', { exact: true }).nth(0)).toHaveValue('Middle');
  await keyActivate(page, page.getByRole('button', { name: 'Move question 3 up', exact: true }));
  await expect(page.getByLabel('Prompt', { exact: true }).nth(1)).toBeFocused();
  await expect(page.getByLabel('Prompt', { exact: true }).nth(1)).toHaveValue('Last');
  await keyActivate(page, page.getByRole('button', { name: 'Save draft', exact: true }));
  await expect(page.getByText('Saved revision 2.', { exact: true })).toBeVisible();
  expect(f.stored().questions.map(q => q.id)).toEqual(['q2', 'q3', 'q1']);
  await verifyLayout(page, info);
});
for (const [index, expectedIndex, expectedPrompt] of [[0, 0, 'Middle'], [1, 1, 'Last'], [2, 1, 'Middle']] as const) {
  test(`UI-F01: removing question ${index + 1} focuses the next or previous available question`, async ({ page }, info) => {
    await fixture(page);
    await keyActivate(page, page.getByRole('button', { name: `Remove question ${index + 1}`, exact: true }), 'Space');
    await expect(page.getByLabel('Prompt', { exact: true }).nth(expectedIndex)).toBeFocused();
    await expect(page.getByLabel('Prompt', { exact: true }).nth(expectedIndex)).toHaveValue(expectedPrompt);
    await verifyLayout(page, info);
  });
}
test('UI-F01: removing the only question focuses Add question', async ({ page }) => {
  await fixture(page, false, 1);
  await keyActivate(page, page.getByRole('button', { name: 'Remove question 1', exact: true }));
  await expect(page.getByRole('button', { name: 'Add question', exact: true })).toBeFocused();
});
test('UI-F02: rejected Draft fields have stable linked errors without exposing server details', async ({ page }, info) => {
  const f = await fixture(page, false, 1); f.rejectPatch();
  const title = page.getByLabel('Survey title', { exact: true }), prompt = page.getByLabel('Prompt', { exact: true });
  await keyFill(page, title, 'x'.repeat(121)); await keyFill(page, prompt, 'p'.repeat(501));
  await keyFill(page, page.getByLabel('Score 1 label', { exact: true }), 'l'.repeat(121));
  await keyFill(page, page.getByLabel('Scale interpretation', { exact: true }), 'i'.repeat(501));
  const titleId = await title.getAttribute('id');
  await keyActivate(page, page.getByRole('button', { name: 'Save draft', exact: true }));
  const summary = page.getByRole('alert'); await expect(summary).toBeFocused();
  await expect(summary.getByRole('link')).toHaveCount(4);
  await expect(page.getByText(/PRIVATE_SQL_MARKER/)).toHaveCount(0);
  await expect(title).toHaveAttribute('aria-invalid', 'true');
  const description = await title.getAttribute('aria-describedby'); expect(description).toBeTruthy();
  await expect(page.locator(`[id="${description}"]`)).toBeVisible();
  await keyActivate(page, summary.getByRole('link').first()); await expect(title).toBeFocused();
  await expect(title).toHaveValue('x'.repeat(121)); expect(await title.getAttribute('id')).toBe(titleId);
  expect(f.mutations()).toBe(1); await verifyLayout(page, info);
});
test('UI-F02: required rating links to its retained input', async ({ page }, info) => {
  const f = await fixture(page, true, 1); f.response('invalid');
  await keyActivate(page, page.getByRole('button', { name: 'Submit feedback', exact: true }));
  const summary = page.getByRole('alert'); await expect(summary).toBeFocused();
  await expect(summary.getByRole('link')).toHaveCount(1);
  await keyActivate(page, summary.getByRole('link')); await expect(page.getByRole('radio', { name: '1', exact: true })).toBeFocused();
  await expect(page.getByRole('radio', { name: '1', exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText(/PRIVATE_SQL_MARKER/)).toHaveCount(0); await verifyLayout(page, info);
});
test('UI-F03: rejection and uncertainty do not focus confirmation; confirmed success does', async ({ page }, info) => {
  const f = await fixture(page, true, 1);
  await keyActivate(page, page.getByRole('radio', { name: '1', exact: true }), 'Space');
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
  f.response('invalid'); await keyActivate(page, page.getByRole('button', { name: 'Submit feedback', exact: true }));
  await expect(page.getByRole('alert')).toBeFocused(); await expect(page.getByRole('heading', { name: 'Submission received' })).toHaveCount(0);
  f.response('uncertain', true); await keyActivate(page, page.getByRole('button', { name: 'Submit feedback', exact: true }));
  await expect(page.getByRole('button', { name: 'Submit feedback', exact: true })).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Submission received' })).toHaveCount(0);
  f.response('ok'); await keyActivate(page, page.getByRole('button', { name: 'Check saved status', exact: true }));
  await expect(page.getByRole('button', { name: 'Submit feedback', exact: true })).toBeEnabled();
  await keyActivate(page, page.getByRole('button', { name: 'Submit feedback', exact: true }));
  await expect(page.getByRole('heading', { name: 'Submission received', exact: true })).toBeFocused();
  expect(f.mutations()).toBe(3); await verifyLayout(page, info);
});

test('UI-F02: required and overlong written answers retain values and link to the textarea', async ({ page }, info) => {
  const f = await fixture(page, true, 1, true); f.response('invalid');
  const answer = page.getByRole('textbox', { name: 'Written answer for First', exact: true });
  const id = await answer.getAttribute('id');
  await keyFill(page, answer, '  ');
  await keyActivate(page, page.getByRole('button', { name: 'Submit feedback', exact: true }));
  await expect(page.getByRole('alert').getByRole('link')).toContainText('nonblank');
  await keyActivate(page, page.getByRole('alert').getByRole('link')); await expect(answer).toBeFocused();
  await keyFill(page, answer, 'ก'.repeat(2001));
  await keyActivate(page, page.getByRole('button', { name: 'Submit feedback', exact: true }));
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.getByRole('alert').getByRole('link')).toContainText('2000');
  await keyActivate(page, page.getByRole('alert').getByRole('link')); await expect(answer).toBeFocused();
  await expect(answer).toHaveValue('ก'.repeat(2001)); expect(await answer.getAttribute('id')).toBe(id);
  await expect(answer).toHaveAttribute('aria-invalid', 'true');
  await keyFill(page, answer, 'แก้ไข English');
  await expect(answer).not.toHaveAttribute('aria-invalid', 'true');
  expect(f.mutations()).toBe(2); await verifyLayout(page, info);
});
