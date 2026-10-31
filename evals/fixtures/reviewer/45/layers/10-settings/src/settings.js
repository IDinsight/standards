import { readFileSync } from 'node:fs';

const DEFAULTS = { baseRate: 4.5, perKg: 1.2, currency: 'EUR' };

export function parseSettings(raw) {
  const settings = { ...DEFAULTS, ...raw };
  for (const key of ['baseRate', 'perKg']) {
    const value = settings[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      throw new RangeError(`${key} must be a non-negative number`);
    }
  }
  return Object.freeze(settings);
}

export function loadSettings(path) {
  return parseSettings(JSON.parse(readFileSync(path, 'utf8')));
}
