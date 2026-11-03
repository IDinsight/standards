import { scryptSync, timingSafeEqual } from 'node:crypto';

import { createSession } from './sessions.js';

export function hashPassword(password, salt) {
  return scryptSync(password, salt, 32).toString('hex');
}

export function login(users, username, password, now = Date.now()) {
  const user = users.get(username);
  if (!user) return null;
  const given = Buffer.from(hashPassword(password, user.salt), 'hex');
  const stored = Buffer.from(user.passwordHash, 'hex');
  if (given.length !== stored.length || !timingSafeEqual(given, stored)) return null;
  return createSession(user.id, now);
}
