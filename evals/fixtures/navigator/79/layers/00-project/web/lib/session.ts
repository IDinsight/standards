import { createHmac, timingSafeEqual } from 'node:crypto';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'coordinator' | 'volunteer';
};

export type Session = { user: SessionUser; expires: number };

export const SESSION_COOKIE = 'portal_session';

function sign(payload: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not set');
  }
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function encodeSession(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(value: string | undefined): Session | null {
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Session;
  return session.expires > Date.now() ? session : null;
}
