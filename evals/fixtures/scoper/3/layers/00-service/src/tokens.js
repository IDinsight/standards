import { randomBytes } from 'node:crypto';

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function createResetToken(store, userId, now = Date.now()) {
  const token = {
    value: randomBytes(16).toString('hex'),
    userId,
    expiresAt: now + RESET_TOKEN_TTL_MS,
  };
  store.saveToken(token);
  return token;
}

export function consumeResetToken(store, value, now = Date.now()) {
  const token = store.getToken(value);
  if (!token || token.expiresAt <= now) return null;
  store.deleteToken(value);
  return token.userId;
}
