import { parseCookies, serializeCookie } from '../../shared/cookies.js';
import { sign, unsign } from '../../shared/signing.js';

export const SESSION_COOKIE = 'tally_sid';
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function cookieOptions(config, maxAge) {
  return {
    maxAge,
    domain: config.cookieDomain,
    httpOnly: true,
    secure: config.secureCookies,
    sameSite: 'Lax',
  };
}

export function sessionCookie(sessionId, config) {
  return serializeCookie(SESSION_COOKIE, sign(sessionId, config.sessionSecret),
    cookieOptions(config, config.sessionTtlSeconds));
}

export function clearedSessionCookie(config) {
  return serializeCookie(SESSION_COOKIE, '', cookieOptions(config, 0));
}

// Returns the session for a request's signed cookie, renewing its expiry, or null.
export function authenticate(request, { sessions, config }) {
  const raw = parseCookies(request.headers.cookie)[SESSION_COOKIE];
  const sessionId = unsign(raw, config.sessionSecret);
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session) return null;
  sessions.touch(sessionId);
  return session;
}

export function csrfOk(request, session) {
  if (!MUTATING.has(request.method)) return true;
  return request.headers['x-csrf-token'] === session.csrfToken;
}

export function hasRole(session, roles) {
  return roles.includes(session.role);
}
