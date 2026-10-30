import { HttpError } from '../http/errors.ts';
import type { Role, User } from './users.ts';

// Server-side role check for route handlers. Throws HttpError(401) when no user
// is attached to the request and HttpError(403) when the user's role is not
// allowed; returns the user otherwise.
export function authorize(user: User | null, allowed: readonly Role[]): User {
  if (!user) throw new HttpError(401, 'authentication required');
  if (!allowed.includes(user.role)) throw new HttpError(403, 'forbidden');
  return user;
}

export function requireAdmin(user: User | null): User {
  return authorize(user, ['admin']);
}
