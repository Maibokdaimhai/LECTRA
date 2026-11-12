import { describe, expect, it } from 'vitest';
import { readConfig } from '../../src/config.js';
const valid = { APP_ORIGIN: 'http://127.0.0.1:5173', DATABASE_URL: 'postgresql://unused@127.0.0.1/lectra_dev', SESSION_SECRET: Buffer.alloc(32, 7).toString('base64url') };
describe('configuration safety', () => {
  it('accepts the explicit local profile', () => { expect(readConfig(valid).PORT).toBe(3001); });
  it.each(['https://example.test/path', 'http://example.test', 'https://a.test,https://b.test', 'https://a.test/', 'https://a.test?x=1'])('rejects unsafe/non-origin APP_ORIGIN %s', origin => {
    expect(() => readConfig({ ...valid, APP_ORIGIN: origin })).toThrow('APP_ORIGIN');
  });
  it('requires HTTPS in production', () => { expect(() => readConfig({ ...valid, NODE_ENV: 'production' })).toThrow('APP_ORIGIN'); });
  it('does not echo secret/connection-string input in configuration errors', () => {
    const marker = 'private-marker';
    try { readConfig({ ...valid, SESSION_SECRET: marker, DATABASE_URL: marker }); throw new Error('Expected validation failure'); }
    catch (error) { expect(String(error)).toContain('SESSION_SECRET'); expect(String(error)).not.toContain(marker); }
  });
  it.each(['0', '65536', 'NaN'])('rejects invalid PORT %s', port => { expect(() => readConfig({ ...valid, PORT: port })).toThrow('PORT'); });
});
