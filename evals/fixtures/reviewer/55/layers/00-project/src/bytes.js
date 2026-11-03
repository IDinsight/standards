const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];
const FACTORS = { B: 1, KB: 1000, MB: 1000 ** 2, GB: 1000 ** 3, TB: 1000 ** 4 };

export function formatBytes(bytes, { digits = 1 } = {}) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new RangeError('bytes must be a non-negative finite number');
  }
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < UNITS.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return unit === 0 ? `${value} B` : `${value.toFixed(digits)} ${UNITS[unit]}`;
}

export function parseBytes(text) {
  const match = /^\s*(\d+(?:\.\d+)?)\s*([A-Za-z]+)?\s*$/.exec(text);
  if (!match) throw new SyntaxError(`cannot parse size: ${text}`);
  const factor = FACTORS[(match[2] ?? 'B').toUpperCase()];
  if (factor === undefined) throw new SyntaxError(`unknown unit: ${match[2]}`);
  return Math.round(Number(match[1]) * factor);
}
