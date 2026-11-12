import { createServer } from 'node:http';
import { Pool } from 'pg';
import { test as base, expect } from '@playwright/test';
import { createApp } from '../../apps/api/src/app.js';
import { readConfig } from '../../apps/api/src/config.js';
import { browserDatabase } from './support/fixtures.js';
import { signIn, barrier } from './support/real-app.js';

type BootstrapHold = { ready: Promise<{ authenticated: boolean; csrfToken: string }>; delivered: Promise<void>; release: () => void };
type LogoutHold = { ready: Promise<void>; release: () => void };
type RaceApp = {
  advance: (ms: number) => void;
  holdBootstrap: () => BootstrapHold;
  holdLogout: () => LogoutHold;
  outage: (enabled: boolean) => Promise<void>;
  attempts: () => number;
  lastError: () => string | undefined;
  idle: () => boolean;
  guestRemoved: (sid: string) => Promise<boolean>;
};
// Specialised fixture: real routes and SQL, with native response headers sent before
// the held body. No route.fetch()/synthetic Set-Cookie or production fault endpoint.
const test = base.extend<{ realApp: RaceApp }>({
  realApp: [async ({}, use) => {
    browserDatabase();
    const config = readConfig(process.env);
    if (config.APP_ORIGIN !== 'http://127.0.0.1:4174') throw new Error('Unexpected isolated browser origin.');
    const control = new Pool({ connectionString: process.env.TEST_DATABASE_URL, connectionTimeoutMillis: 3000 });
    let now = Date.now(), renamed = false, attempts = 0, error: string | undefined;
    let nextBootstrap: { ready: (value: { authenticated: boolean; csrfToken: string }) => void; body: ReturnType<typeof barrier>; delivered: ReturnType<typeof barrier> } | undefined;
    let nextLogout: { reached: ReturnType<typeof barrier>; body: ReturnType<typeof barrier> } | undefined;
    const releases: (() => void)[] = [];
    const pending = new Set<object>();
    const app = createApp(config, () => now), originalJson = app.response.json;
    app.response.json = function (body: any) {
      if (this.req.path === '/api/auth/logout') error = body?.error?.code;
      if (this.req.path === '/api/auth/session' && nextBootstrap) {
        const held = nextBootstrap; nextBootstrap = undefined;
        const bytes = JSON.stringify(body);
        this.setHeader('Content-Type', 'application/json; charset=utf-8');
        this.setHeader('Content-Length', Buffer.byteLength(bytes));
        this.flushHeaders(); // express-session sends its actual HttpOnly cookie here.
        this.write(bytes.slice(0, 1)); // Flush through Vite's streaming proxy; JSON is still incomplete.
        held.ready({ authenticated: body.data.authenticated, csrfToken: body.data.csrfToken });
        this.once('finish', held.delivered.resolve);
        void held.body.promise.then(() => this.end(bytes.slice(1)));
        return this;
      }
      return originalJson.call(this, body);
    };
    const server = createServer((req, res) => {
      pending.add(req);
      res.once('finish', () => pending.delete(req));
      res.once('close', () => pending.delete(req));
      if (req.method === 'POST' && req.url === '/api/auth/logout') {
        attempts++;
        if (nextLogout) {
          const held = nextLogout; nextLogout = undefined; held.reached.resolve();
          void held.body.promise.then(() => app(req, res)); return;
        }
      }
      app(req, res);
    });
    try {
      await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(3102, '127.0.0.1', resolve); });
      await use({
        advance: ms => { now += ms; },
        holdBootstrap() {
          let ready!: (value: { authenticated: boolean; csrfToken: string }) => void;
          const promise = new Promise<{ authenticated: boolean; csrfToken: string }>(resolve => { ready = resolve; });
          const body = barrier(), delivered = barrier(); nextBootstrap = { ready, body, delivered }; releases.push(body.resolve);
          return { ready: promise, delivered: delivered.promise, release: body.resolve };
        },
        holdLogout() {
          const reached = barrier(), body = barrier(); nextLogout = { reached, body }; releases.push(body.resolve);
          return { ready: reached.promise, release: body.resolve };
        },
        async outage(enabled) {
          browserDatabase();
          if (enabled && !renamed) { await control.query('ALTER TABLE auth_session RENAME TO pr45_csrf_sessions'); renamed = true; }
          else if (!enabled && renamed) { await control.query('ALTER TABLE pr45_csrf_sessions RENAME TO auth_session'); renamed = false; }
        },
        attempts: () => attempts, lastError: () => error,
        idle: () => pending.size === 0,
        guestRemoved: async sid => (await control.query('SELECT 1 FROM auth_session WHERE sid=$1', [sid])).rowCount === 0
      });
    } finally {
      for (const release of releases) release();
      try { if (renamed) await control.query('ALTER TABLE pr45_csrf_sessions RENAME TO auth_session'); }
      finally {
        await new Promise<void>(resolve => { server.close(() => resolve()); server.closeAllConnections(); });
        try { await app.locals.close(); } finally { await control.end(); }
      }
    }
  }, { auto: true }]
});

test('PR45-CSRF real expiry, native guest-cookie headers, failed logout and deliberate current-token retry', async ({ page, realApp }) => {
  let sessionChecks = 0, navigations = 0;
  page.on('request', req => { if (new URL(req.url()).pathname === '/api/auth/session') sessionChecks++; });
  await signIn(page);
  await expect(page.getByLabel('Course', { exact: true }).locator('option').nth(1)).toBeAttached();
  await expect(page.getByRole('button', { name: 'Open survey', exact: true }).first()).toBeVisible();
  // Let initial private reads finish before advancing expiry: a late expired
  // read can itself clear the cookie and would introduce a different race.
  await expect.poll(realApp.idle).toBe(true);
  page.on('framenavigated', frame => { if (frame === page.mainFrame()) navigations++; });
  const priorCookie = (await page.context().cookies()).find(cookie => cookie.name === 'lectra.sid')!.value;
  const bootstrap = realApp.holdBootstrap();
  realApp.advance(28_800_001);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  const guest = await bootstrap.ready;
  expect(guest.authenticated).toBe(false);
  await expect.poll(async () => {
    const current = (await page.context().cookies()).find(cookie => cookie.name === 'lectra.sid')?.value;
    return Boolean(current && current !== priorCookie);
  }).toBe(true);
  const guestCookie = (await page.context().cookies()).find(cookie => cookie.name === 'lectra.sid')!.value;
  const guestSid = decodeURIComponent(guestCookie).slice(2).split('.')[0]!;
  await realApp.outage(true);
  const failed = page.waitForResponse(r => new URL(r.url()).pathname === '/api/auth/logout');
  await page.getByRole('button', { name: 'Log out', exact: true }).click();
  expect((await failed).status()).toBe(503); expect(realApp.lastError()).toBe('AUTH_SERVICE_UNAVAILABLE');
  await expect(page.getByRole('heading', { name: 'Signing out', exact: true })).toBeVisible();
  await expect(page.locator('.workspace')).toHaveCount(0);
  const privacy = await page.evaluateHandle(() => {
    const state = { leaked: false };
    const observer = new MutationObserver(() => { if (document.querySelector('.workspace')) state.leaked = true; });
    observer.observe(document.body, { childList: true, subtree: true });
    return { state, disconnect: () => observer.disconnect() };
  });
  await expect(page.getByRole('button', { name: 'Retry sign-out', exact: true })).toBeEnabled();
  await realApp.outage(false);
  bootstrap.release(); await bootstrap.delivered;
  expect(realApp.attempts()).toBe(1);
  const checksBeforeRetry = sessionChecks, logout = realApp.holdLogout();
  const confirmed = page.waitForResponse(r => new URL(r.url()).pathname === '/api/auth/logout');
  await page.getByRole('button', { name: 'Retry sign-out', exact: true }).click();
  await logout.ready;
  await expect(page.getByRole('heading', { name: 'Signing out', exact: true })).toBeVisible();
  await expect(page.locator('.workspace')).toHaveCount(0);
  logout.release();
  const result = await confirmed;
  expect(result.status()).toBe(204); // Old implementation returns real 403 CSRF_INVALID.
  expect(await result.request().headerValue('x-csrf-token') === guest.csrfToken).toBe(true);
  expect(sessionChecks).toBeGreaterThan(checksBeforeRetry);
  await expect(page.getByRole('heading', { name: 'Log in', exact: true })).toBeVisible();
  expect(realApp.attempts()).toBe(2); expect(navigations).toBe(0);
  expect(await privacy.evaluate(check => check.state.leaked)).toBe(false);
  await privacy.evaluate(check => check.disconnect());
  expect(await realApp.guestRemoved(guestSid)).toBe(true);
  expect((await page.request.get('/api/auth/me')).status()).toBe(401);
});
