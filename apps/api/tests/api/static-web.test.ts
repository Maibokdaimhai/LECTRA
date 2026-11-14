import { afterAll, beforeAll, expect, it } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { createApp } from '../../src/app.js';

let root: string;
beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'lectra-static-test-'));
  await mkdir(join(root, 'assets'));
  await writeFile(join(root, 'index.html'), '<!doctype html><title>LECTRA packaged UI fixture</title>');
  await writeFile(join(root, 'assets', 'app.js'), 'console.log("packaged asset");');
  await writeFile(join(root, '.private'), 'must never be served');
});
afterAll(async () => { await rm(root, { recursive: true, force: true }); });
it('EP3-W01: serves packaged HTML and assets, with index cache disabled', async () => {
  const app = createApp(undefined, undefined, root);
  const home = await request(app).get('/').expect(200);
  expect(home.text).toContain('LECTRA packaged UI fixture');
  expect(home.headers['cache-control']).toContain('no-store');
  expect((await request(app).get('/assets/app.js').expect(200)).text).toContain('packaged asset');
  expect((await request(app).get('/surveys/view').accept('html').expect(200)).text).toContain('LECTRA packaged UI fixture');
});
it('EP3-W02: API misses stay JSON; missing assets, dotfiles and unsafe methods never become SPA pages', async () => {
  const app = createApp(undefined, undefined, root);
  const missing = await request(app).get('/api/no-such-route').accept('html').expect(404);
  expect(missing.body.error.code).toBe('NOT_FOUND');
  expect(missing.headers['content-type']).toContain('application/json');
  await request(app).get('/assets/missing.js').accept('html').expect(404);
  await request(app).get('/.private').expect(404);
  await request(app).post('/').send({}).expect(404);
  await request(app).get('/unknown').accept('json').expect(404);
});
