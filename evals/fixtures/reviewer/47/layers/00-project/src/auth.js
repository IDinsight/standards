import { readFileSync } from 'node:fs';

const access = JSON.parse(readFileSync(new URL('../config/access.json', import.meta.url), 'utf8'));

export function can(user, permission) {
  if (!user) return false;
  const roles = access.permissions[permission] ?? [];
  return roles.includes(user.role);
}
