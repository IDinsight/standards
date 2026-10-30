import { randomBytes } from 'node:crypto';

export const SESSION_COOKIE = 'sid';
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export class SessionStore {
  constructor(now = () => Date.now()) {
    this.now = now;
    this.sessions = new Map();
  }

  create(userId, { scopes = [] } = {}) {
    const id = randomBytes(24).toString('base64url');
    this.sessions.set(id, { userId, scopes, expiresAt: this.now() + SESSION_TTL_MS });
    return id;
  }

  lookup(id) {
    const session = this.sessions.get(id);
    if (!session) return null;
    if (session.expiresAt <= this.now()) {
      this.sessions.delete(id);
      return null;
    }
    return session;
  }

  revoke(id) {
    return this.sessions.delete(id);
  }
}

export function readSessionCookie(cookieHeader) {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === SESSION_COOKIE) return rest.join('=') || null;
  }
  return null;
}

export function sessionCookieHeader(id) {
  return `${SESSION_COOKIE}=${id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}`;
}
