import { expect, it } from 'vitest';
import { AUTH_LIFETIME, liveAuth, validToken } from '../../src/auth-rules.js';
it('TEST-F01-U02: exact absolute deadline rejects expiry without renewal', () => {
  const state = { authenticatedAt: 100, authExpiresAt: 100 + AUTH_LIFETIME };
  expect(liveAuth(state, state.authExpiresAt - 1)).toBe(true);
  expect(liveAuth(state, state.authExpiresAt)).toBe(false);
  expect(liveAuth(state, state.authExpiresAt + 1)).toBe(false);
});
it('TEST-F01-U07: future, missing and inconsistent timestamps cannot authenticate', () => {
  for (const value of [{}, { authenticatedAt: 101, authExpiresAt: 101 + AUTH_LIFETIME }, { authenticatedAt: 0, authExpiresAt: AUTH_LIFETIME + 1 }]) expect(liveAuth(value, 100)).toBe(false);
});
it('TEST-F01-U03: malformed and cross-session CSRF tokens are rejected', () => {
  const token = 'a'.repeat(43);
  expect(validToken(token, token)).toBe(true);
  for (const value of [undefined, '', token + 'a', 'b'.repeat(43), ['a']]) expect(validToken(value, token)).toBe(false);
});
