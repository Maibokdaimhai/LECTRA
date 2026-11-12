import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
describe('tooling HTTP liveness (not product acceptance)', () => {
  it('reports process liveness without claiming database/session readiness', async () => {
    const response = await request(createApp()).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { status: 'ok', service: 'lectra-api' } });
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });
  it('does not create an auth endpoint or actor from a supplied role', async () => {
    const response = await request(createApp()).post('/api/auth/login').send({ role: 'OWNER' });
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: { code: 'NOT_FOUND', message: 'Route not found.' } });
  });
});
