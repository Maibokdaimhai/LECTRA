import express from 'express';
import type { AppConfig } from './config.js';
import { setupAuth } from './auth.js';
import { errorHandler } from './http.js';
import { setupFeedback } from './feedback.js';
import { fileURLToPath } from 'node:url';
import { setupWeb } from './web.js';
export function createApp(config?: AppConfig, now?: () => number, webRoot?: string) {
  const app = express();
  app.disable('x-powered-by');
  app.disable('etag');
  app.set('trust proxy', config?.TRUST_PROXY === '1' ? 1 : false);
  app.get('/api/health', (_request, response) => {
    response.set('Cache-Control', 'no-store').json({ data: { status: 'ok', service: 'lectra-api' } });
  });
  // Before session/auth middleware: readiness must reflect the database even
  // with a stale cookie, and must never create a session or expose connection errors.
  app.get('/api/ready', async (_request, response) => {
    response.set('Cache-Control', 'no-store');
    try {
      const pool = app.locals.auth?.pool;
      if (!pool) throw new Error('Database not configured');
      await pool.query({ text: 'SELECT 1', query_timeout: 2000 });
      response.json({ data: { status: 'ready', db: 'connected' } });
    } catch {
      response.status(503).json({ data: { status: 'not_ready' } });
    }
  });
  if (config) { const auth = setupAuth(app, config, now); app.locals.auth = auth; app.locals.close = auth.close; setupFeedback(app, auth.pool); }
  app.use('/api', (_request, response) => {
    response.status(404).set('Cache-Control', 'no-store').json({ error: { code: 'NOT_FOUND', message: 'Route not found.' } });
  });
  const root = webRoot ?? (config?.NODE_ENV === 'production' ? fileURLToPath(new URL('../../web/dist/', import.meta.url)) : undefined);
  if (root) setupWeb(app, root);
  app.use(errorHandler);
  return app;
}
