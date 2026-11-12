import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  APP_ORIGIN: z.url(),
  DATABASE_URL: z.url().refine(value => {
    try {
      const url = new URL(value);
      return ['postgres:', 'postgresql:'].includes(url.protocol) && Boolean(url.hostname) && url.pathname.length > 1;
    } catch { return false; }
  }),
  SESSION_SECRET: z.string().regex(/^[A-Za-z0-9_-]{43,}$/).refine(value => !value.startsWith('replace-') && Buffer.from(value, 'base64url').length >= 32)
});

export function readConfig(environment: NodeJS.ProcessEnv) {
  const parsed = schema.safeParse(environment);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map(issue => issue.path[0]))].join(', ');
    throw new Error(`Invalid configuration fields: ${fields}`);
  }
  const origin = new URL(parsed.data.APP_ORIGIN);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname);
  const validTransport = origin.protocol === 'https:' ||
    (parsed.data.NODE_ENV !== 'production' && origin.protocol === 'http:' && local);
  if (!validTransport || origin.username || origin.password || origin.search || origin.hash ||
      origin.pathname !== '/' || parsed.data.APP_ORIGIN !== origin.origin) {
    throw new Error('Invalid configuration fields: APP_ORIGIN');
  }
  return Object.freeze({ ...parsed.data, APP_ORIGIN: origin.origin });
}

export type AppConfig = ReturnType<typeof readConfig>;
