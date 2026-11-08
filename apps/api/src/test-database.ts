export function assertTestDatabase(input: { testUrl?: string; developmentUrl?: string; allowName?: string }): string {
  try {
    function target(raw: string | undefined) {
      if (!raw) throw new Error();
      const url = new URL(raw);
      if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || url.pathname.length <= 1) throw new Error();
      // pg-connection-string lets query parameters replace the authority host/port.
      // Reject overrides on both URLs so the isolation comparison stays authoritative.
      for (const key of url.searchParams.keys()) {
        if (['host', 'port'].includes(key.toLowerCase())) throw new Error();
      }
      const name = decodeURIComponent(url.pathname.slice(1));
      const host = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ? 'loopback' : url.hostname;
      return { name, key: `${host}:${url.port || '5432'}/${name}` };
    }
    const test = target(input.testUrl);
    const development = target(input.developmentUrl);
    if (!/^lectra_test(?:_[a-z0-9_]+)?$/.test(test.name) || input.allowName !== test.name || test.key === development.key) throw new Error();
    return test.name;
  } catch {
    throw new Error('Unsafe test database configuration');
  }
}
