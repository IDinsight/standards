import { createHmac, timingSafeEqual } from 'node:crypto';

export function sign(value, secret) {
  const mac = createHmac('sha256', secret).update(value).digest('base64url');
  return `${value}.${mac}`;
}

export function unsign(signed, secret) {
  if (typeof signed !== 'string') return null;
  const index = signed.lastIndexOf('.');
  if (index <= 0) return null;
  const value = signed.slice(0, index);
  const expected = Buffer.from(sign(value, secret).slice(index + 1));
  const actual = Buffer.from(signed.slice(index + 1));
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  return value;
}
