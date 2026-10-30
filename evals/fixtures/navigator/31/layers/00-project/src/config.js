import { readFileSync } from 'node:fs';

export function loadConfig(env = process.env.APP_ENV ?? 'development') {
  const file = new URL(`../config/${env}.json`, import.meta.url);
  return JSON.parse(readFileSync(file, 'utf8'));
}
