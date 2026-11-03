import { randomBytes } from 'node:crypto';

export const SESSION_TTL_MS = 30 * 60 * 1000;

export function createSession(userId, now = Date.now()) {
  return { id: randomBytes(16).toString('hex'), userId, expiresAt: now + SESSION_TTL_MS };
}

export function isExpired(session, now = Date.now()) {
  return now >= session.expiresAt;
}
