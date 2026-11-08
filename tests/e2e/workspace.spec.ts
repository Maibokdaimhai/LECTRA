import { expect, test } from '@playwright/test';
test('real browser proxy reaches the API liveness endpoint', async ({ page }, testInfo) => {
  const response = page.waitForResponse(r => r.url().endsWith('/api/health') && r.status() === 200);
  await page.goto('/');
  expect(await (await response).json()).toEqual({ data: { status: 'ok', service: 'lectra-api' } });
  await expect(page.getByRole('heading', { name: 'LECTRA', exact: true })).toBeVisible();
  await expect(page.getByText('Service connection ready.', { exact: true })).toHaveText('Service connection ready.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: `.local/evidence/workspace-${testInfo.project.name}.png` });
});
test('same-origin proxy requires real authentication for survey access', async ({ request }) => {
  const response = await request.get('/api/surveys');
  expect(response.status()).toBe(401);
  expect((await response.json()).error.code).toBe('AUTH_REQUIRED');
});
