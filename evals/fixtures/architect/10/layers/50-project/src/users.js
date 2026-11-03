import { readFileSync } from 'node:fs';

export function loadUsers(file) {
  const users = JSON.parse(readFileSync(file, 'utf8'));
  return users.map((user) => ({ id: user.id, name: user.name, email: user.email }));
}
