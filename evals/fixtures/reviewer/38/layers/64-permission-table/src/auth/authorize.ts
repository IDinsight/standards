import { HttpError } from '../http/errors.ts';
import type { Role, User } from './users.ts';

export type Permission = 'records:read' | 'records:manage';

// What each role may do. Handlers check a permission instead of listing roles,
// so a change to what a role may do happens here only.
const PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: ['records:read', 'records:manage'],
  editor: ['records:read'],
  viewer: ['records:read'],
};

export function can(user: User | null, permission: Permission): boolean {
  return user !== null && PERMISSIONS[user.role].includes(permission);
}

// Throws HttpError(401) when no user is attached to the request and
// HttpError(403) when the user lacks the permission; returns the user otherwise.
export function requirePermission(user: User | null, permission: Permission): User {
  if (!user) throw new HttpError(401, 'authentication required');
  if (!can(user, permission)) throw new HttpError(403, 'forbidden');
  return user;
}

// Role-list check for handlers that name roles directly. Same 401 and 403
// responses as requirePermission.
export function authorize(user: User | null, allowed: readonly Role[]): User {
  if (!user) throw new HttpError(401, 'authentication required');
  if (!allowed.includes(user.role)) throw new HttpError(403, 'forbidden');
  return user;
}

// Only administrators hold records:manage.
export function requireAdmin(user: User | null): User {
  return requirePermission(user, 'records:manage');
}
