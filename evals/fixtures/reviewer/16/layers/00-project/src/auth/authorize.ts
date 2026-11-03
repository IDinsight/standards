import { HttpError } from '../http/errors.ts';
import type { Role, User } from './users.ts';

// Server-side role check: 401 without a user, 403 for a role not allowed.
export function authorize(user: User | null, allowed: readonly Role[]): User {
  if (!user) throw new HttpError(401, 'authentication required');
  if (!allowed.includes(user.role)) throw new HttpError(403, 'forbidden');
  return user;
}

export function requireAdmin(user: User | null): User {
  return authorize(user, ['admin']);
}
