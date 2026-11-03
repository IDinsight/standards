import { createHmac, timingSafeEqual } from 'node:crypto';

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const decode = (part) => JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));

function signature(body, secret) {
  return createHmac('sha256', secret).update(body).digest('base64url');
}

export function issueToken({ sub, scopes = [] }, secret, { now = Date.now(), ttlSeconds = 3600 } = {}) {
  const payload = { sub, scopes, exp: Math.floor(now / 1000) + ttlSeconds };
  const body = encode(payload);
  return `${body}.${signature(body, secret)}`;
}

export function verifyToken(token, secret, { now = Date.now() } = {}) {
  const [body, sig] = String(token).split('.');
  if (!body || !sig) return { ok: false, reason: 'malformed' };
  const expected = Buffer.from(signature(body, secret));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return { ok: false, reason: 'signature' };
  }
  const payload = decode(body);
  if (payload.exp * 1000 <= now) return { ok: false, reason: 'expired' };
  return { ok: true, payload };
}
