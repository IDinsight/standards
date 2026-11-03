import { AuthError, toResponse } from './errors.js';
import { verifyPassword } from './passwords.js';
import { issueToken } from './tokens.js';

export function login({ users, lockout, secret, now = Date.now() }, body = {}) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  try {
    if (!email || !password) throw new AuthError('missing_credentials');
    const lockedMs = lockout.lockedForMs(email);
    if (lockedMs > 0) {
      throw new AuthError('account_locked', { retryAfterSeconds: Math.ceil(lockedMs / 1000) });
    }
    const user = users.get(email);
    if (!user || !verifyPassword(password, user.password)) {
      lockout.recordFailure(email);
      throw new AuthError('invalid_credentials');
    }
    lockout.recordSuccess(email);
    return { status: 200, headers: {}, body: { token: issueToken(user.id, secret, now) } };
  } catch (error) {
    if (error instanceof AuthError) return toResponse(error);
    throw error;
  }
}
