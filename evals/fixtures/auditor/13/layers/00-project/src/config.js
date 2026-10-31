import { readFileSync } from 'node:fs';
import path from 'node:path';

export const DEFAULTS = Object.freeze({ maxDepth: 3, bullet: '-' });

// Read .mdtocrc.json from dir, falling back to the defaults.
export function loadConfig(dir) {
  let raw;
  try {
    raw = readFileSync(path.join(dir, '.mdtocrc.json'), 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return { ...DEFAULTS };
    throw error;
  }
  const config = { ...DEFAULTS, ...JSON.parse(raw) };
  if (!Number.isInteger(config.maxDepth) || config.maxDepth < 2 || config.maxDepth > 6) {
    throw new Error('.mdtocrc.json: maxDepth must be an integer from 2 to 6');
  }
  if (!['-', '*', '+'].includes(config.bullet)) {
    throw new Error('.mdtocrc.json: bullet must be "-", "*", or "+"');
  }
  return config;
}
