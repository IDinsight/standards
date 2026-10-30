import { readFileSync } from 'node:fs';

const DEFAULT_PATH = new URL('../config/default.json', import.meta.url);

export function loadConfig(path = DEFAULT_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
