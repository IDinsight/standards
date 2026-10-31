import { readFileSync } from 'node:fs';

const DEFAULTS = { baseRate: 4.5, perKg: 1.2, currency: 'EUR', freeShippingThreshold: null };

export function parseSettings(raw) {
  const settings = { ...DEFAULTS, ...raw };
  for (const key of ['baseRate', 'perKg']) {
    const value = settings[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      throw new RangeError(`${key} must be a non-negative number`);
    }
  }
  const threshold = settings.freeShippingThreshold;
  if (threshold !== null && (typeof threshold !== 'number' || !Number.isFinite(threshold) || threshold < 0)) {
    throw new RangeError('freeShippingThreshold must be null or a non-negative number');
  }
  return Object.freeze(settings);
}

export function loadSettings(path) {
  return parseSettings(JSON.parse(readFileSync(path, 'utf8')));
}
