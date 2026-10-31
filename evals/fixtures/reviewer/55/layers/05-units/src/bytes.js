const UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
const FACTORS = { B: 1, KIB: 1024, MIB: 1024 ** 2, GIB: 1024 ** 3, TIB: 1024 ** 4 };

export function formatBytes(bytes, { digits = 1 } = {}) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new RangeError('bytes must be a non-negative finite number');
  }
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
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
