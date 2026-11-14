import { createApp } from './app.js';
import { readConfig } from './config.js';
try {
  const config = readConfig(process.env);
  const app = createApp(config);
  const server = app.listen(config.PORT, '0.0.0.0', () => {
    console.info(`LECTRA API listening on port ${config.PORT}`);
  });
  server.on('error', () => { console.error('API failed to listen.'); process.exitCode = 1; });
  let stopping = false;
  let forced = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    server.close(() => { Promise.resolve(app.locals.close?.()).then(() => { if (!forced) process.exitCode = 0; }, () => { process.exitCode = 1; }); });
    server.closeIdleConnections();
    const deadline = setTimeout(() => { forced = true; server.closeAllConnections(); process.exitCode = 1; }, 5000);
    deadline.unref();
  };
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Invalid configuration.');
  process.exitCode = 1;
}
