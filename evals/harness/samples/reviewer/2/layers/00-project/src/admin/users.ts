import { requireAdmin, type User } from '../auth/authorize.ts';

export function listUsers(actor: User, all: User[]): User[] {
  requireAdmin(actor);
  return all;
}
