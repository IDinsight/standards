import { readFileSync } from 'node:fs';

export function loadUsers(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
