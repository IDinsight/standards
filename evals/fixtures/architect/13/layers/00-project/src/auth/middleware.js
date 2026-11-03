import { AuthError, toResponse } from './errors.js';
import { verifyToken } from './tokens.js';

export function authenticate(headers, secret, now = Date.now()) {
  const match = /^Bearer (\S+)$/.exec(headers.authorization ?? '');
  if (!match) throw new AuthError('token_missing');
  return verifyToken(match[1], secret, now);
}

export function withAuth(handler, secret) {
  return (request) => {
    try {
      const claims = authenticate(request.headers ?? {}, secret);
      return handler({ ...request, userId: claims.sub });
    } catch (error) {
      if (error instanceof AuthError) return toResponse(error);
      throw error;
    }
  };
}
