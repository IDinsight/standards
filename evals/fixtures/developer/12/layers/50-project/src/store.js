import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export function load(path) {
  if (!existsSync(path)) return [];
  const data = JSON.parse(readFileSync(path, 'utf8'));
  return data.items ?? [];
}

export function save(path, items) {
  writeFileSync(path, `${JSON.stringify({ items }, null, 2)}\n`);
}
