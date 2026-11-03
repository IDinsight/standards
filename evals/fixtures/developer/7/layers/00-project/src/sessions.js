import { randomBytes } from 'node:crypto';

const sessions = new Map();

export function createSession(user) {
  const id = randomBytes(16).toString('hex');
  sessions.set(id, user);
  return id;
}

export function sessionFromCookie(header = '') {
  const match = /(?:^|;\s*)sid=([0-9a-f]+)/.exec(header ?? '');
  return match ? sessions.get(match[1]) ?? null : null;
}

export function endSession(id) {
  sessions.delete(id);
}
