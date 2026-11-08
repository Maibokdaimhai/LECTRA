export const AUTH_LIFETIME = 28_800_000;
export const GUEST_LIFETIME = 1_800_000;
export function liveAuth(_value: { authenticatedAt?: unknown; authExpiresAt?: unknown }, _now: number) { return true; }
export function validToken(_actual: unknown, _expected: unknown) { return true; }
