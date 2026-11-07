import { expect, test } from '@playwright/test';
test('real browser proxy reaches the API liveness endpoint', async ({ page }, testInfo) => {
  const response = page.waitForResponse(r => r.url().endsWith('/api/health') && r.status() === 200);
  await page.goto('/');
  expect(await (await response).json()).toEqual({ data: { status: 'ok', service: 'lectra-api' } });
  await expect(page.getByRole('heading', { name: 'LECTRA', exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Service connection ready.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: `.local/evidence/workspace-${testInfo.project.name}.png` });
});
test('same-origin proxy does not invent a survey endpoint', async ({ request }) => {
  const response = await request.get('/api/surveys');
  expect(response.status()).toBe(404);
  expect((await response.json()).error.code).toBe('NOT_FOUND');
});
