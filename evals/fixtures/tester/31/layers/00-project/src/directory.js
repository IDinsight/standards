import { readFileSync } from 'node:fs';

// Staff records carry extra fields (team) that callers do not need.
export function loadUsers(path) {
  const records = JSON.parse(readFileSync(path, 'utf8'));
  return records.map(({ id, name, email }) => ({ id, name, email }));
}

export function findUserById(users, id) {
  return users.find((user) => user.id === id) ?? null;
}
