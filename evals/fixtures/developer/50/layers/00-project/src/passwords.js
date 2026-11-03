import { randomBytes, scryptSync } from 'node:crypto';

const SALT_BYTES = 16;
const KEY_LENGTH = 32;

// Stored form: "<salt hex>:<derived key hex>".
export function hashPassword(password) {
  const salt = randomBytes(SALT_BYTES).toString('hex');
  const key = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${key}`;
}
