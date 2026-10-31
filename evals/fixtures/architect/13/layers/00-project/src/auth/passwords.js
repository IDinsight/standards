import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 32;

export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return { salt, hash: scryptSync(password, salt, KEY_LENGTH).toString('hex') };
}

export function verifyPassword(password, record) {
  const candidate = scryptSync(password, record.salt, KEY_LENGTH);
  return timingSafeEqual(candidate, Buffer.from(record.hash, 'hex'));
}
