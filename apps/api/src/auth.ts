import express, { type Express, type Request, type Response, type RequestHandler } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';
import argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { rateLimit } from 'express-rate-limit';
import type { AppConfig } from './config.js';
import { AUTH_LIFETIME, GUEST_LIFETIME, liveAuth, validToken, tokenShape } from './auth-rules.js';
import { exact, fail, HttpError } from './http.js';

declare module 'express-session' {
  interface SessionData { userId?: string; authenticatedAt?: number; authExpiresAt?: number; csrfToken?: string; guestCreatedAt?: number; guestExpiresAt?: number; }
}
export type Actor = Readonly<{ userId: string; role: 'OWNER' | 'RESPONDENT'; displayName: string }>;
declare global { namespace Express { interface Request { actor?: Actor; authExpired?: boolean; } } }
const token = () => randomBytes(32).toString('base64url');
const operation = (req: Request, method: 'save' | 'regenerate' | 'destroy') => new Promise<void>((resolve, reject) => req.session[method](error => error ? reject(new HttpError(503, 'AUTH_SERVICE_UNAVAILABLE')) : resolve()));
const safeUser = (actor: Actor) => ({ id: actor.userId, displayName: actor.displayName, role: actor.role });
export const authenticated: RequestHandler = (req, _res, next) => { if (!req.actor) return next(new HttpError(401, req.authExpired ? 'SESSION_EXPIRED' : 'AUTH_REQUIRED')); next(); };
export const role = (expected: Actor['role']): RequestHandler => (req, _res, next) => { if (!req.actor) return next(new HttpError(401, 'AUTH_REQUIRED')); if (req.actor.role !== expected) return next(new HttpError(403, 'FORBIDDEN_ROLE')); next(); };
export const csrf: RequestHandler = (req, _res, next) => { if (!validToken(req.headers['x-csrf-token'], req.session?.csrfToken)) return next(new HttpError(403, 'CSRF_INVALID')); next(); };

export function setupAuth(app: Express, config: AppConfig, now: () => number = Date.now) {
  const pool = new Pool({ connectionString: config.DATABASE_URL, options: '-c timezone=UTC', connectionTimeoutMillis: 3000 });
  const Store = connectPgSimple(session);
  class AbsoluteStore extends Store {
    override set(sid: string, value: session.SessionData, callback?: (error?: unknown) => void) {
      const deadline=value.authExpiresAt ?? value.guestExpiresAt;
      if(typeof deadline!=='number'||!Number.isSafeInteger(deadline)){callback?.(new Error('Invalid session deadline'));return;}
      super.set(sid,value,error=>{
        if(error){callback?.(error);return;}
        // Upstream rounds up to seconds. Correct the persisted timestamp before save acknowledgement.
        // A concurrent destroy must remain destroyed; UPDATE never recreates the SID.
        void pool.query("UPDATE auth_session SET expire=(to_timestamp($2::double precision / 1000) AT TIME ZONE 'UTC') WHERE sid=$1",[sid,deadline]).then(()=>callback?.(),()=>callback?.(new Error('Session persistence unavailable')));
      });
    }
  }
  pool.on('error',()=>{console.error('Authentication database connection unavailable.');});
  const store = new AbsoluteStore({ pool, tableName: 'auth_session', createTableIfMissing: false, disableTouch: true, pruneSessionInterval: false, errorLog: ()=>console.error('Session store operation failed.') });
  const secure = config.APP_ORIGIN.startsWith('https:');
  const cookieName = secure ? '__Host-lectra.sid' : 'lectra.sid';
  const cookie = { httpOnly: true, secure, sameSite: 'lax' as const, path: '/' };
  const clear = (res: Response) => res.clearCookie(cookieName, cookie);
  let dummy: Promise<string> | undefined;
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    const unsafe = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
    const supplied = req.headers.origin;
    let validOrigin = false;
    try { const origin = new URL(supplied ?? ''); validOrigin = origin.origin === config.APP_ORIGIN && !origin.username && !origin.password && origin.pathname === '/' && !origin.search && !origin.hash; } catch { /* reject below */ }
    if ((unsafe || supplied !== undefined) && !validOrigin) return next(new HttpError(403, 'ORIGIN_FORBIDDEN'));
    if (req.path === '/auth/session' && req.headers['sec-fetch-site'] === 'cross-site') return next(new HttpError(403, 'ORIGIN_FORBIDDEN'));
    const authMethods: Record<string, string> = { '/auth/session': 'GET', '/auth/me': 'GET', '/auth/login': 'POST', '/auth/logout': 'POST' };
    const method = authMethods[req.path];
    if (method && req.method !== method) { res.set('Allow', method); return next(new HttpError(405, 'METHOD_NOT_ALLOWED')); }
    if (unsafe) {
      if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers['content-type'] ?? '') || (req.headers['content-encoding'] && req.headers['content-encoding'] !== 'identity')) return next(new HttpError(415, 'UNSUPPORTED_CONTENT'));
      const limit = req.path.startsWith('/auth/') || !(/responses$/.test(req.path) || req.method === 'PATCH') ? 8192 : 262144;
      return express.raw({ type: () => true, limit, inflate: false })(req, res, next);
    }
    if ((Number(req.headers['content-length']) > 0) || req.headers['transfer-encoding']) return next(new HttpError(400, 'UNEXPECTED_BODY'));
    next();
  });
  const sessions = session({ name: cookieName, secret: config.SESSION_SECRET, store, resave: false, saveUninitialized: false, rolling: false, cookie });
  app.use('/api', (req, res, next) => sessions(req, res, error => next(error ? new HttpError(503, 'AUTH_SERVICE_UNAVAILABLE') : undefined)));
  app.use('/api', async (req, res, next) => {
    try {
      if (Buffer.isBuffer(req.body)) { try { req.body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(req.body)); } catch { fail(400, 'MALFORMED_JSON'); } }
      const s = req.session;
      const isAuth = Boolean(s.userId);
      const authLive = isAuth && typeof s.userId === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(s.userId) && tokenShape(s.csrfToken) && liveAuth(s, now());
      const guestLive = !isAuth && tokenShape(s.csrfToken) && Number.isSafeInteger(s.guestCreatedAt) && Number.isSafeInteger(s.guestExpiresAt) && s.guestCreatedAt! <= now() && s.guestExpiresAt === s.guestCreatedAt! + GUEST_LIFETIME && now() < s.guestExpiresAt!;
      if (authLive) {
        let found;
        try { found = await pool.query('SELECT id,role,"displayName" FROM "User" WHERE id=$1', [s.userId]); } catch { fail(503, 'AUTH_SERVICE_UNAVAILABLE'); }
        const user = found!.rows[0];
        if (user && ['OWNER', 'RESPONDENT'].includes(user.role)) req.actor = Object.freeze({ userId: user.id, role: user.role, displayName: user.displayName });
      }
      if ((!authLive && !guestLive && (isAuth || s.csrfToken)) || (authLive && !req.actor)) {
        req.authExpired = isAuth && typeof s.authExpiresAt === 'number' && now() >= s.authExpiresAt;
        await operation(req, 'destroy'); clear(res);
      } else if (authLive || guestLive) cap(req, authLive ? s.authExpiresAt! : s.guestExpiresAt!);
      next();
    } catch (error) { next(error); }
  });
  function cap(req: Request, deadline: number) {
    // express-session touches Cookie on response; its getter must remain absolute.
    Object.defineProperty(req.session.cookie, 'expires', { configurable: true, enumerable: true, get: () => new Date(deadline), set: () => undefined });
  }
  async function guest(req: Request) {
    if (!req.session || !req.session.csrfToken) {
      // regenerate works through middleware even after a destroyed session via req.sessionStore.
      await new Promise<void>((resolve, reject) => req.sessionStore.regenerate(req, error => error ? reject(new HttpError(503, 'AUTH_SERVICE_UNAVAILABLE')) : resolve()));
      Object.assign(req.session, { csrfToken: token(), guestCreatedAt: now(), guestExpiresAt: now() + GUEST_LIFETIME });
      cap(req, req.session.guestExpiresAt!); await operation(req, 'save');
    }
  }
  app.get('/api/auth/session', async (req, res) => {
    if (Object.keys(req.query).length) fail(422, 'VALIDATION_FAILED');
    await guest(req);
    res.json({ data: { authenticated: Boolean(req.actor), user: req.actor ? safeUser(req.actor) : null, expiresAt: req.actor ? new Date(req.session.authExpiresAt!).toISOString() : null, csrfToken: req.session.csrfToken } });
  });
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, handler: (_req, res) => { res.set('Retry-After', '900').status(429).json({ error: { code: 'LOGIN_RATE_LIMITED', message: 'Too many login attempts. Try again later.' } }); } });
  app.post('/api/auth/login', csrf, (req, _res, next) => {
    if (req.actor) fail(409, 'ALREADY_AUTHENTICATED');
    exact(req.body, ['email', 'password']);
    const { email, password } = req.body;
    if (typeof email !== 'string' || email.trim().length > 254 || !/^[\x21-\x7e]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || typeof password !== 'string' || [...password].length < 1 || [...password].length > 128) fail(422, 'VALIDATION_FAILED');
    next();
  }, limiter, async (req, res) => {
    let user;
    try { user = (await pool.query('SELECT id,role,"displayName","passwordHash" FROM "User" WHERE email=$1', [req.body.email.trim().toLowerCase()])).rows[0]; } catch { fail(503, 'AUTH_SERVICE_UNAVAILABLE'); }
    dummy ??= argon2.hash(randomBytes(32), { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1, hashLength: 32 });
    const valid = await argon2.verify(user?.passwordHash ?? await dummy, req.body.password);
    if (!valid || !user) fail(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
    await operation(req, 'regenerate');
    Object.assign(req.session, { userId: user.id, authenticatedAt: now(), authExpiresAt: now() + AUTH_LIFETIME, csrfToken: token() });
    cap(req, req.session.authExpiresAt!); await operation(req, 'save');
    res.json({ data: { user: { id: user.id, displayName: user.displayName, role: user.role }, expiresAt: new Date(req.session.authExpiresAt!).toISOString(), csrfToken: req.session.csrfToken } });
  });
  app.get('/api/auth/me', authenticated, (req, res) => { if (Object.keys(req.query).length) fail(422, 'VALIDATION_FAILED'); res.json({ data: { user: safeUser(req.actor!), expiresAt: new Date(req.session.authExpiresAt!).toISOString() } }); });
  app.post('/api/auth/logout', async (req, res) => {
    const supplied = req.headers['x-csrf-token'];
    if (!tokenShape(supplied) || (req.session?.csrfToken && !validToken(supplied, req.session.csrfToken))) fail(403, 'CSRF_INVALID');
    exact(req.body, []);
    if (req.session) await operation(req, 'destroy');
    clear(res); res.sendStatus(204);
  });
  return { pool, close: () => pool.end() };
}
