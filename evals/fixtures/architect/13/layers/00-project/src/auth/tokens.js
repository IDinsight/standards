import { createHmac, timingSafeEqual } from 'node:crypto';

import { AuthError } from './errors.js';

export const TOKEN_TTL_SECONDS = 60 * 60;

function sign(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function issueToken(userId, secret, now = Date.now()) {
  const claims = { sub: userId, exp: Math.floor(now / 1000) + TOKEN_TTL_SECONDS };
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return payload + '.' + sign(payload, secret);
}

export function verifyToken(token, secret, now = Date.now()) {
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra !== undefined) throw new AuthError('token_invalid');
  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new AuthError('token_invalid');
  }
  let claims;
  try {
    claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    throw new AuthError('token_invalid');
  }
  if (typeof claims.exp !== 'number') throw new AuthError('token_invalid');
  if (claims.exp * 1000 <= now) throw new AuthError('token_expired');
  return claims;
}
