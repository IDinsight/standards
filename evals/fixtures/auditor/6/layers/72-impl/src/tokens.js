import { createHmac, timingSafeEqual } from 'node:crypto';

function sign(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function signToken({ userId, expiresAt, scope = 'session' }, secret) {
  const payload = `${scope}.${userId}.${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyToken(token, secret, now = Date.now()) {
  const parts = String(token).split('.');
  if (parts.length !== 4) return null;
  const [scope, userId, expiresAt, signature] = parts;
  const expected = Buffer.from(sign(`${scope}.${userId}.${expiresAt}`, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (Number(expiresAt) <= now) return null;
  return { scope, userId, expiresAt: Number(expiresAt) };
}
