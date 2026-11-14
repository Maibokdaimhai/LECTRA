import { expect, it } from 'vitest';
import { readConfig } from '../../src/config.js';

const input = { NODE_ENV: 'production', APP_ORIGIN: 'https://lectra.example.test', DATABASE_URL: 'postgresql://unused@127.0.0.1/lectra', SESSION_SECRET: Buffer.alloc(32, 9).toString('base64url') };
it('EP2-C01: proxy trust is disabled unless explicitly configured for one ingress hop', () => {
  expect(readConfig(input).TRUST_PROXY).toBe('none');
  expect(readConfig({ ...input, TRUST_PROXY: '1', PORT: '8080' }).TRUST_PROXY).toBe('1');
  expect(readConfig({ ...input, PORT: '8080' }).PORT).toBe(8080);
});
it.each(['true', '*', '2', 'false'])('EP2-C02: rejects unbounded or unsupported proxy trust %s', value => {
  expect(() => readConfig({ ...input, TRUST_PROXY: value })).toThrow('TRUST_PROXY');
});
