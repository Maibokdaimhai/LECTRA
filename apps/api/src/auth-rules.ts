import { timingSafeEqual } from 'node:crypto';
export const AUTH_LIFETIME = 28_800_000;
export const GUEST_LIFETIME = 1_800_000;
export function liveAuth(value: { authenticatedAt?: unknown; authExpiresAt?: unknown }, now: number) {
  const { authenticatedAt: start, authExpiresAt: end } = value;
  return typeof start === 'number' && typeof end === 'number' && Number.isSafeInteger(start) && Number.isSafeInteger(end) &&
    start <= now && now < end && end === start + AUTH_LIFETIME;
}
export const tokenShape = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value);
export function validToken(actual: unknown, expected: unknown) {
  return tokenShape(actual) && tokenShape(expected) && timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}
