import { HttpError } from '../http/errors.js';

// Server-side role check for route handlers. Throws HttpError(401) when no user
// is attached to the request and HttpError(403) when the user's role is not
// allowed; returns the user otherwise.
export function authorize(user, allowed) {
  if (!user) throw new HttpError(401, 'authentication required');
  if (!allowed.includes(user.role)) throw new HttpError(403, 'forbidden');
  return user;
}

export function requireAdmin(user) {
  return authorize(user, ['admin']);
}
