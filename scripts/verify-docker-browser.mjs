import { chromium, expect } from '@playwright/test';
import { chmodSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const baseURL = process.env.EP3_BASE_URL;
const output = process.env.EP3_EVIDENCE_DIR;
const storage = process.env.EP3_BROWSER_STATE_FILE;
const phase = process.env.EP3_BROWSER_PHASE;
if (!baseURL?.startsWith('http://127.0.0.1:') || !output || !storage || !['before', 'after'].includes(phase)) throw new Error('Explicit isolated Docker browser verification settings required.');
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 900 }, ...(phase === 'after' ? { storageState: storage } : {}) });
  const page = await context.newPage();
  await page.goto('/');
  if (phase === 'before') {
    await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeEnabled();
    await page.getByLabel('Email', { exact: true }).fill('owner.1@example.test');
    await page.getByLabel('Password', { exact: true }).fill(process.env.SEED_OWNER_PASSWORD);
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
  }
  await expect(page.getByRole('button', { name: 'Log out', exact: true })).toBeVisible();
  await page.getByRole('listitem').filter({ hasText: 'Episode 3 container feedback' }).getByRole('button', { name: 'Open survey', exact: true }).click();
  await expect(page.getByText('Episode 3 persisted suggestion', { exact: true })).toBeVisible();
  // Screenshots are taken only after login; no password field, token or cookie is exposed.
  await page.screenshot({ path: join(output, `${phase}-results-wide.png`), fullPage: true });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.screenshot({ path: join(output, `${phase}-results-narrow.png`), fullPage: true });
  if (phase === 'before') {
    await context.storageState({ path: storage });
    chmodSync(storage, 0o600);
  } else {
    await page.getByRole('button', { name: 'Log out', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeEnabled();
    await expect(page.getByText('Episode 3 persisted suggestion', { exact: true })).not.toBeVisible();
    await page.screenshot({ path: join(output, 'after-logout.png'), fullPage: true });
  }
  await context.close();
  console.info(`Docker browser ${phase}: packaged UI, real persisted owner results, ${phase === 'after' ? 'retained browser session and logout' : 'real login and private session capture'} verified.`);
} finally { await browser.close(); }
