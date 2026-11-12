import { chromium, expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';

export async function tabTo(page: Page, target: Locator) {
  await expect(target).toBeVisible();
  await expect(target).toBeEnabled();
  for (let i = 0; i < 120; i++) {
    if (await target.evaluate(element => element === document.activeElement)) {
      const focus = await target.evaluate(element => { const style = getComputedStyle(element); return { visible: element.matches(':focus-visible'), outline: style.outlineStyle, width: parseFloat(style.outlineWidth) }; });
      expect(focus.visible).toBe(true); expect(focus.outline).not.toBe('none'); expect(focus.width).toBeGreaterThanOrEqual(2);
      return;
    }
    await page.keyboard.press('Tab');
  }
  throw new Error('The requested control could not be reached with Tab.');
}
export async function keyFill(page: Page, target: Locator, value: string) {
  await tabTo(page, target);
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(value);
}
export async function keyActivate(page: Page, target: Locator, key = 'Enter') {
  await tabTo(page, target);
  await page.keyboard.press(key);
}

// Override only the page for the supplementary project; existing fixtures stay intact.
export async function zoomPage({ page, baseURL }: { page: Page; baseURL: string | undefined }, use: (page: Page) => Promise<void>, info: TestInfo) {
  if (!info.project.name.endsWith('zoom200')) return use(page);
  const directory = await mkdtemp(join(tmpdir(), 'lectra-ui-zoom-'));
  let context;
  try {
    const extension = join(directory, 'extension');
    await mkdir(extension);
    await writeFile(join(extension, 'manifest.json'), JSON.stringify({ manifest_version: 3, name: 'LECTRA test zoom', version: '1.0', permissions: ['tabs'], background: { service_worker: 'background.js' } }));
    await writeFile(join(extension, 'background.js'), 'chrome.runtime.onInstalled.addListener(() => {});');
    context = await chromium.launchPersistentContext(join(directory, 'profile'), {
      executablePath: chromium.executablePath(), headless: true, baseURL, viewport: { width: 1280, height: 900 },
      ignoreDefaultArgs: ['--disable-extensions'],
      args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`]
    });
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    const zoomed = await context.newPage();
    if (!baseURL) throw new Error('A local browser test origin is required.');
    // Establish the origin without bootstrapping the application before fixtures exist.
    await zoomed.route('**/*', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Zoom setup</title>' }));
    await zoomed.goto(baseURL);
    await zoomed.unroute('**/*');
    const factor = await worker.evaluate(async origin => {
      const api = (globalThis as unknown as { chrome: { tabs: {
        query: (options: object) => Promise<{ id: number; url?: string }[]>;
        setZoomSettings: (id: number, settings: object) => Promise<void>;
        setZoom: (id: number, factor: number) => Promise<void>;
        getZoom: (id: number) => Promise<number>;
      } } }).chrome.tabs;
      const tab = (await api.query({})).find(tab => tab.url?.startsWith(origin));
      if (!tab) throw new Error('The isolated browser tab was not found.');
      // Per-origin zoom survives the real application navigation and reloads.
      await api.setZoomSettings(tab.id, { mode: 'automatic', scope: 'per-origin' });
      await api.setZoom(tab.id, 2);
      return api.getZoom(tab.id);
    }, new URL(baseURL).origin);
    expect(factor).toBe(2);
    await zoomed.waitForFunction(() => innerWidth === 640 && devicePixelRatio === 2);
    await info.attach('genuine-browser-zoom', { body: JSON.stringify({ factor, ...await zoomed.evaluate(() => ({ innerWidth, outerWidth, devicePixelRatio })) }), contentType: 'application/json' });
    await use(zoomed);
  } finally {
    await context?.close();
    const target = resolve(directory);
    if (dirname(target) !== resolve(tmpdir()) || !basename(target).startsWith('lectra-ui-zoom-')) throw new Error('Unexpected temporary browser directory.');
    await rm(target, { recursive: true, force: true });
  }
}

export async function verifyLayout(page: Page, info: TestInfo) {
  const dimensions = await page.evaluate(() => ({ innerWidth, outerWidth, dpr: devicePixelRatio, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth);
  if (info.project.name.endsWith('zoom200')) expect(dimensions).toMatchObject({ innerWidth: 640, outerWidth: 1280, dpr: 2 });
}
