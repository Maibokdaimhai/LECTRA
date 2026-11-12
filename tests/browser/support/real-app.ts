import { test as base, expect, type Page, type TestInfo } from '@playwright/test';
import { createApp } from '../../../apps/api/src/app.js';
import { readConfig } from '../../../apps/api/src/config.js';
import { browserDatabase, ScenarioData, type LectureFixture } from './fixtures.js';

export const test = base.extend<{ realApp: { advance: (ms: number) => void }; data: ScenarioData }>({
  realApp: [async ({}, use) => {
    browserDatabase();
    const config = readConfig(process.env);
    if (config.APP_ORIGIN !== 'http://127.0.0.1:4174') throw new Error('Browser origin must match the isolated Vite server.');
    let now = Date.now();
    const app = createApp(config, () => now);
    const server = app.listen(3102, '127.0.0.1');
    try {
      await new Promise<void>((resolve, reject) => { server.once('listening', resolve); server.once('error', () => reject(new Error('Issue23 API port 3102 is unavailable; no existing server will be reused.'))); });
      await use({ advance: ms => { now += ms; } });
    } finally {
      await new Promise<void>(resolve => { server.close(() => resolve()); server.closeAllConnections(); });
      await app.locals.close();
    }
  }, { auto: true }],
  data: async ({ realApp }, use, info) => {
    void realApp;
    const data = new ScenarioData(`${info.project.name}:${info.title}`);
    try { await use(data); } finally { await data.cleanup(); }
  }
});
export { expect };

export async function signIn(page: Page, email = 'owner.1@example.test') {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeEnabled();
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(email.startsWith('respondent.') ? process.env.SEED_RESPONDENT_PASSWORD! : process.env.SEED_OWNER_PASSWORD!);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Log out', exact: true })).toBeVisible();
}
export async function read(page: Page, path: string) {
  const response = await page.request.get(path);
  expect(response.status()).toBe(200);
  return (await response.json()).data;
}
export function barrier() {
  let resolve!: () => void;
  const promise = new Promise<void>(done => { resolve = done; });
  return { promise, resolve };
}
export async function confirmAction(page: Page, name: string) {
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name, exact: true }).click();
}
export async function openSurvey(page: Page, title: string) {
  await page.getByRole('listitem').filter({ hasText: title }).getByRole('button', { name: 'Open survey', exact: true }).click();
}
export async function screenshot(page: Page, info: TestInfo, name: string) {
  await page.screenshot({ path: info.outputPath(`${name}.png`), fullPage: true });
}
export async function createSurvey(page: Page, lecture: LectureFixture, title: string, publish = true) {
  await page.getByLabel('Course', { exact: true }).selectOption({ label: lecture.courseCode });
  await page.getByLabel('Section', { exact: true }).selectOption({ label: lecture.sectionCode });
  await page.getByLabel('Lecture', { exact: true }).selectOption(lecture.id);
  const created = page.waitForResponse(r => new URL(r.url()).pathname === '/api/surveys' && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Create draft', exact: true }).click();
  expect((await created).status()).toBe(201);
  await page.getByLabel('Survey title', { exact: true }).fill(title);
  await page.getByRole('button', { name: 'Add question', exact: true }).click();
  const rating = page.getByRole('group', { name: 'Question 1', exact: true });
  await rating.getByLabel('Prompt', { exact: true }).fill('Understanding');
  await rating.getByLabel('Score 1 label', { exact: true }).fill('Low');
  await rating.getByLabel('Score 5 label', { exact: true }).fill('High');
  await rating.getByLabel('Scale interpretation', { exact: true }).fill('Higher means clearer');
  await page.getByRole('button', { name: 'Add question', exact: true }).click();
  const text = page.getByRole('group', { name: 'Question 2', exact: true });
  await text.getByRole('combobox', { name: 'Question type', exact: true }).selectOption('TEXT');
  await text.getByLabel('Prompt', { exact: true }).fill('Next time');
  await text.getByLabel('Required', { exact: true }).uncheck();
  const saved = page.waitForResponse(r => r.request().method() === 'PATCH');
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  const definition = (await (await saved).json()).data;
  await expect(page.getByText('Saved revision 2.', { exact: true })).toBeVisible();
  if (publish) {
    await confirmAction(page, 'Publish survey');
    await expect(page.getByRole('button', { name: 'Close survey', exact: true })).toBeVisible();
  }
  return definition;
}
