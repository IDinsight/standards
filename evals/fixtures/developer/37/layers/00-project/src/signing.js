import { createHmac } from 'node:crypto';

export function sign(body, secret) {
  return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}

export function verify(body, secret, signature) {
  return sign(body, secret) === signature;
}
