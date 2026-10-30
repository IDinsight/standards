import { createHmac, timingSafeEqual } from 'node:crypto';

function mac(body, secret) {
  return createHmac('sha256', secret).update(body).digest('base64url');
}

export function signToken(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return body + '.' + mac(body, secret);
}

export function verifyToken(token, secret) {
  const [body, signature] = String(token).split('.');
  if (!body || !signature) return null;
  const given = Buffer.from(signature);
  const expected = Buffer.from(mac(body, secret));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
}
