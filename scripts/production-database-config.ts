// Explicit, forward-only operator commands. Never imported by the app server.
export function productionTarget(environment: NodeJS.ProcessEnv, action: string) {
  const refuse = () => { throw new Error('Production database operation requires an explicit matching target and production mode.'); };
  if (environment.NODE_ENV !== 'production' || !['migrate', 'seed'].includes(action)) return refuse();
  let url: URL;
  try { url = new URL(environment.DATABASE_URL ?? ''); } catch { return refuse(); }
  const name = decodeURIComponent(url.pathname.slice(1));
  // No hidden routing override: pg and Prisma must receive the same target.
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || !/^[a-z][a-z0-9_]*$/.test(name) ||
      [...url.searchParams.keys()].some(k => ['host', 'port'].includes(k.toLowerCase())) ||
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
