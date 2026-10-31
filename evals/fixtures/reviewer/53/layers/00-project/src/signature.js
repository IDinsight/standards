import { createHmac } from 'node:crypto';

// Value for the signature header: HMAC-SHA256 of the raw body, hex encoded.
export function signPayload(secret, body) {
  return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}
