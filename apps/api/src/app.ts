import express from 'express';
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', false);
  app.get('/api/health', (_request, response) => {
    response.set('Cache-Control', 'no-store').json({ data: { status: 'ok', service: 'lectra-api' } });
  });
  app.use('/api', (_request, response) => {
    response.status(404).set('Cache-Control', 'no-store').json({ error: { code: 'NOT_FOUND', message: 'Route not found.' } });
  });
  return app;
}
