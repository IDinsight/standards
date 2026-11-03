import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DEFAULT_PATH = fileURLToPath(new URL('../config/settings.json', import.meta.url));
const DEFAULTS = { company: '', taxRate: 0 };

export function loadSettings(path = DEFAULT_PATH) {
  return { ...DEFAULTS, ...JSON.parse(readFileSync(path, 'utf8')) };
}
