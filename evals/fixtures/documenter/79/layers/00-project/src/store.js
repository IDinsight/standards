import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export function loadItems(path) {
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, 'utf8')).items ?? [];
}

export function saveItems(path, items) {
  writeFileSync(path, `${JSON.stringify({ items }, null, 2)}\n`);
}
