import express, { type Express } from 'express';
import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';

export function setupWeb(app: Express, root: string) {
  const index = join(root, 'index.html');
  // API-only Compose image intentionally has no SPA. No effect on API routing.
  if (!existsSync(index)) return;
  app.use((req, res, next) => {
    let pathname: string;
    // Match serve-static's single URI decode; never rewrite req.url or decode
    // twice. Query-string encoding is unrelated to pathname exclusions.
    try { pathname = decodeURIComponent(req.path); }
    catch { res.set('Cache-Control', 'no-store').sendStatus(400); return; }
    if (pathname.includes('\0')) { res.set('Cache-Control', 'no-store').sendStatus(400); return; }
    if (pathname.split('/').some(segment => segment.startsWith('.'))) { res.set('Cache-Control', 'no-store').sendStatus(404); return; }
    res.locals.lectraWebPath = pathname;
    next();
  });
  app.use(express.static(root, { index: false, dotfiles: 'deny', fallthrough: true, maxAge: '1h',
    setHeaders: (res, path) => { if (path.endsWith('/index.html')) res.setHeader('Cache-Control', 'no-store'); }
  }));
  app.use((req, res, next) => {
    const pathname = res.locals.lectraWebPath as string;
    if (!['GET', 'HEAD'].includes(req.method) || !req.accepts('html') || extname(pathname) || pathname.startsWith('/assets/')) return next();
    res.set('Cache-Control', 'no-store').sendFile(index, error => { if (error) next(error); });
  });
}
