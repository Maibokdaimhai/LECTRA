// Explicit, forward-only operator commands. Never imported by the app server.
export function productionTarget(environment: NodeJS.ProcessEnv, action: string) {
  const refuse = () => { throw new Error('Production database operation requires an explicit matching target and production mode.'); };
  if (environment.NODE_ENV !== 'production' || !['migrate', 'seed'].includes(action)) return refuse();
  let url: URL;
  try { url = new URL(environment.DATABASE_URL ?? ''); } catch { return refuse(); }
  const name = decodeURIComponent(url.pathname.slice(1));
  const routing = [...url.searchParams.keys()].filter(k => ['host', 'port'].includes(k.toLowerCase()));
  // Cloud SQL is an explicit operator-selected socket, never an arbitrary URL override.
  const instance = environment.ALLOW_CLOUD_SQL_INSTANCE;
  const socket = instance && /^[a-z][a-z0-9-]{4,28}[a-z0-9]:[a-z]+-[a-z]+[0-9]:[a-z][a-z0-9-]*$/.test(instance)
    ? `/cloudsql/${instance}` : undefined;
  const explicitSocket = socket && url.hostname === 'localhost' && !url.port &&
    routing.length === 1 && routing[0] === 'host' && url.searchParams.get('host') === socket &&
    [...url.searchParams.keys()].every(k => ['host', 'schema', 'connection_limit'].includes(k)) &&
    (!url.searchParams.has('schema') || url.searchParams.get('schema') === 'public') &&
    (!url.searchParams.has('connection_limit') || url.searchParams.get('connection_limit') === '3') &&
    [...new Set(url.searchParams.keys())].length === [...url.searchParams.keys()].length;
  // No hidden routing override: pg and Prisma must receive the same target.
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || url.hash || !/^[a-z][a-z0-9_]*$/.test(name) ||
      (routing.length > 0 && !explicitSocket) ||
      (instance !== undefined && !explicitSocket) ||
      environment.ALLOW_PRODUCTION_DATABASE !== name) return refuse();
  if (action === 'seed') {
    if (environment.SEED_PRODUCTION_DEMO !== name) throw new Error('Production demo seed requires a second explicit target confirmation.');
    const values = [environment.SEED_OWNER_PASSWORD, environment.SEED_RESPONDENT_PASSWORD];
    if (values.some(v => !v || [...v].length < 12 || [...v].length > 128 || v.includes('\0') || /^(replace|change-me)/i.test(v)))
      throw new Error('Production demo passwords must be supplied privately (12–128 code points), without placeholders.');
    if (values[0] === values[1]) throw new Error('Production demo roles require different passwords.');
  }
  return { connectionString: environment.DATABASE_URL!, name };
}
