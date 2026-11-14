import express, { type Express } from 'express';
import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';

export function setupWeb(app: Express, root: string) {
  const index = join(root, 'index.html');
  // API-only Compose image intentionally has no SPA. No effect on API routing.
  if (!existsSync(index)) return;
  app.use((req, res, next) => {
    if (req.path.split('/').some(segment => segment.startsWith('.'))) { res.sendStatus(404); return; }
    next();
  });
  app.use(express.static(root, { index: false, dotfiles: 'deny', fallthrough: true, maxAge: '1h',
    setHeaders: (res, path) => { if (path.endsWith('/index.html')) res.setHeader('Cache-Control', 'no-store'); }
  }));
  app.use((req, res, next) => {
    if (!['GET', 'HEAD'].includes(req.method) || !req.accepts('html') || extname(req.path) || req.path.startsWith('/assets/')) return next();
    res.set('Cache-Control', 'no-store').sendFile(index, error => { if (error) next(error); });
  });
}
