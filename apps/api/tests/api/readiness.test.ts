import request from 'supertest';
import { expect, it } from 'vitest';
import { createApp } from '../../src/app.js';

it('EP2-R01: readiness is unavailable without a configured database; liveness still works', async () => {
  const app = createApp();
  const response = await request(app).get('/api/ready');
  expect(response.status).toBe(503);
  expect(response.body).toEqual({ data: { status: 'not_ready' } });
  expect(response.headers['cache-control']).toBe('no-store');
  expect(response.headers['set-cookie']).toBeUndefined();
  expect((await request(app).get('/api/health')).status).toBe(200);
});
