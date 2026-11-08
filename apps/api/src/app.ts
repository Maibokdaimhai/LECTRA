import express from 'express';
import type { AppConfig } from './config.js';
import { setupAuth } from './auth.js';
import { errorHandler } from './http.js';
import { setupFeedback } from './feedback.js';
export function createApp(config?: AppConfig, now?: () => number) {
  const app = express();
  app.disable('x-powered-by');
  app.disable('etag');
  app.set('trust proxy', false);
  app.get('/api/health', (_request, response) => {
    response.set('Cache-Control', 'no-store').json({ data: { status: 'ok', service: 'lectra-api' } });
  });
  if (config) { const auth = setupAuth(app, config, now); app.locals.auth = auth; app.locals.close = auth.close; setupFeedback(app, auth.pool); }
  app.use('/api', (_request, response) => {
    response.status(404).set('Cache-Control', 'no-store').json({ error: { code: 'NOT_FOUND', message: 'Route not found.' } });
  });
  app.use(errorHandler);
  return app;
}
