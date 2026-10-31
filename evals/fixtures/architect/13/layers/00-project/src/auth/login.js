import { AuthError, toResponse } from './errors.js';
import { verifyPassword } from './passwords.js';
import { issueToken } from './tokens.js';

export function login({ users, secret, now = Date.now() }, body = {}) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  try {
    if (!email || !password) throw new AuthError('missing_credentials');
    const user = users.get(email);
    if (!user || !verifyPassword(password, user.password)) throw new AuthError('invalid_credentials');
    return { status: 200, headers: {}, body: { token: issueToken(user.id, secret, now) } };
  } catch (error) {
    if (error instanceof AuthError) return toResponse(error);
    throw error;
  }
}
