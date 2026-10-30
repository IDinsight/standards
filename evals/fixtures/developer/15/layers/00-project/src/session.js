import { createHmac, timingSafeEqual } from 'node:crypto';

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function decode(segment) {
  return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));
}

function mac(keys, kid, data) {
  const key = keys[kid];
  if (!key) throw new Error(`no signing key for kid ${kid}`);
  return createHmac('sha256', key).update(data).digest();
}

export function sign(claims, keys, kid) {
  const head = encode({ alg: 'HS256', kid });
  const body = encode(claims);
  return `${head}.${body}.${mac(keys, kid, `${head}.${body}`).toString('base64url')}`;
}

export function verifySession(token, keys) {
  const [head, body = '', signature = ''] = String(token).split('.');
  const { kid } = decode(head);
  const expected = mac(keys, kid, `${head}.${body}`);
  const given = Buffer.from(signature, 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    throw new Error('signature mismatch');
  }
  return decode(body);
}
