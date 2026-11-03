import { randomBytes } from 'node:crypto';

const MAX_AGE_MS = 12 * 60 * 60 * 1000;

export class SessionStore {
  constructor({ now = () => Date.now() } = {}) {
    this.now = now;
    this.sessions = new Map();
  }

  create(userId) {
    const created = this.now();
    const session = { id: randomBytes(18).toString('base64url'), userId, created, lastSeen: created };
    this.sessions.set(session.id, session);
    return session;
  }

  get(id) {
    const session = this.sessions.get(id);
    if (!session) return null;
    const now = this.now();
    if (now - session.created > MAX_AGE_MS) {
      this.sessions.delete(id);
      return null;
    }
    session.lastSeen = now;
    return session;
  }

  destroy(id) {
    this.sessions.delete(id);
  }
}
