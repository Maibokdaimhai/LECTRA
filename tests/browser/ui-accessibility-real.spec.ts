import { test as base, expect, createSurvey, read } from './support/real-app.js';
import { keyActivate, keyFill, tabTo, verifyLayout, zoomPage } from './support/ui-keyboard.js';
import type { Page, TestInfo } from '@playwright/test';
const test = base.extend({ page: zoomPage });
async function login(page: Page, email = 'owner.1@example.test') {
  await page.goto('/');
  await keyFill(page, page.getByLabel('Email', { exact: true }), email);
  await keyFill(page, page.getByLabel('Password', { exact: true }), email.startsWith('respondent.') ? process.env.SEED_RESPONDENT_PASSWORD! : process.env.SEED_OWNER_PASSWORD!);
  await keyActivate(page, page.getByRole('button', { name: 'Log in', exact: true }));
  await expect(page.getByRole('button', { name: 'Log out', exact: true })).toBeVisible();
}
async function open(page: Page, title: string) {
  await keyActivate(page, page.getByRole('listitem').filter({ hasText: title }).getByRole('button', { name: 'Open survey', exact: true }));
}
async function capture(page: Page, info: TestInfo, name: string) {
  const session = await page.context().newCDPSession(page);
  try {
    const { data } = await session.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
    await info.attach(name, { body: Buffer.from(data, 'base64'), contentType: 'image/png' });
  } finally { await session.detach(); }
}
test('UI-F01/F02 real Draft rejection retains fields and keyboard reorder persists', async ({ page, data }, info) => {
  await login(page);
  const definition = await createSurvey(page, await data.lecture(), `UI Draft ${info.project.name}`, false);
  const title = page.getByLabel('Survey title', { exact: true });
  await keyFill(page, title, 'x'.repeat(121));
  const rejected = page.waitForResponse(r => r.request().method() === 'PATCH');
  await keyActivate(page, page.getByRole('button', { name: 'Save draft', exact: true }));
  expect((await rejected).status()).toBe(422);
  const summary = page.getByRole('alert');
  await expect(summary).toBeFocused(); await expect(title).toHaveAttribute('aria-invalid', 'true');
  await keyActivate(page, summary.getByRole('link', { name: /Survey title/ }));
  await expect(title).toBeFocused(); await expect(title).toHaveValue('x'.repeat(121));
  await capture(page, info, 'draft-field-error'); await verifyLayout(page, info);
  await keyFill(page, title, `แก้ไข Draft ${info.project.name}`);
  await keyActivate(page, page.getByRole('button', { name: 'Move question 2 up', exact: true }), 'Space');
  await expect(page.getByLabel('Prompt', { exact: true }).first()).toBeFocused();
  await expect(page.getByLabel('Prompt', { exact: true }).first()).toHaveValue('Next time');
  const saved = page.waitForResponse(r => r.request().method() === 'PATCH');
  await keyActivate(page, page.getByRole('button', { name: 'Save draft', exact: true }));
  expect((await saved).status()).toBe(200);
  await expect(page.getByText('Saved revision 3.', { exact: true })).toBeVisible();
  const persisted = await read(page, `/api/surveys/${definition.id}`);
  expect(persisted.questions.map((q: { id: string }) => q.id)).toEqual([definition.questions[1].id, definition.questions[0].id]);
  await keyActivate(page, page.getByRole('button', { name: 'Remove question 2', exact: true }));
  await expect(page.getByLabel('Prompt', { exact: true })).toBeFocused();
  await keyActivate(page, page.getByRole('button', { name: 'Remove question 1', exact: true }));
  await expect(page.getByRole('button', { name: 'Add question', exact: true })).toBeFocused();
  await verifyLayout(page, info);
});
test('UI-F02/F03 real rejection, retained text, confirmed success focus and Closed results', async ({ page, data }, info) => {
  const title = `UI Submission ${info.project.name}`;
  await login(page);
  const definition = await createSurvey(page, await data.lecture(), title);
  await keyActivate(page, page.getByRole('button', { name: 'Log out', exact: true }));
  await login(page, 'respondent.11@example.test'); await open(page, title);
  const answer = page.getByRole('textbox', { name: 'Written answer for Next time', exact: true });
  const comment = 'ข้อเสนอแนะ English <script>unsafe()</script> ' + 'รายละเอียด '.repeat(20);
  await keyFill(page, answer, comment);
  const rejected = page.waitForResponse(r => r.request().method() === 'POST' && r.url().endsWith('/responses'));
  await keyActivate(page, page.getByRole('button', { name: 'Submit feedback', exact: true }));
  const response = await rejected; expect(response.status()).toBe(422); expect((await response.json()).error.code).toBe('INVALID_ANSWERS');
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Submission received', exact: true })).toHaveCount(0);
  expect(await data.responseRows(definition.id)).toEqual({ participation: 0, bundles: 0, answers: 0 });
  await expect(answer).toHaveValue(comment);
  await keyActivate(page, page.getByRole('alert').getByRole('link'));
  const first = page.getByRole('radio', { name: '1', exact: true }); await expect(first).toBeFocused();
  const description = await first.getAttribute('aria-describedby'); expect(description).toBeTruthy();
  await expect(page.locator(`[id="${description}"]`)).toBeVisible();
  await page.keyboard.press('Space'); await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: '2', exact: true })).toBeChecked();
  await verifyLayout(page, info); await capture(page, info, 'response-validation');
  const accepted = page.waitForResponse(r => r.request().method() === 'POST' && r.url().endsWith('/responses'));
  await keyActivate(page, page.getByRole('button', { name: 'Submit feedback', exact: true }));
  expect((await accepted).status()).toBe(201);
  await expect(page.getByRole('heading', { name: 'Submission received', exact: true })).toBeFocused();
  expect((await read(page, `/api/surveys/${definition.id}/my-submission`)).answers).toEqual([{ questionId: definition.questions[0].id, value: 2 }, { questionId: definition.questions[1].id, value: comment }]);
  expect(await data.responseRows(definition.id)).toEqual({ participation: 1, bundles: 1, answers: 2 });
  await verifyLayout(page, info); await capture(page, info, 'submission-focus');
  await keyActivate(page, page.getByRole('button', { name: 'Log out', exact: true }));
  await login(page); await open(page, title);
  await expect(page.getByText('Responses: 1', { exact: true })).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await keyActivate(page, page.getByRole('button', { name: 'Close survey', exact: true }));
  await expect(page.getByText('2.00', { exact: true })).toBeVisible();
  expect((await read(page, `/api/surveys/${definition.id}/results`)).questions[0].mean).toBe('2.00');
  await expect(page.getByText(comment, { exact: true })).toBeVisible();
  await expect(page.getByText(comment, { exact: true }).locator('script')).toHaveCount(0);
  await tabTo(page, page.getByRole('button', { name: 'Back to survey list', exact: true }));
  await verifyLayout(page, info); await capture(page, info, 'closed-results');
});
