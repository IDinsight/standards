import { HttpError } from './http.ts';

export type Role = 'admin' | 'editor' | 'viewer';
export type User = { id: number; name: string; role: Role };

// Server-side role check: 401 without a user, 403 for a role not allowed.
export function authorize(user: User | null, allowed: readonly Role[]): User {
  if (!user) throw new HttpError(401, 'authentication required');
  if (!allowed.includes(user.role)) throw new HttpError(403, 'forbidden');
  return user;
}

export function requireAdmin(user: User | null): User {
  return authorize(user, ['admin']);
}
