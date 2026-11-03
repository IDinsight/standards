const DECIMAL_UNITS = ['B', 'kB', 'MB', 'GB', 'TB'];

export function formatBytes(bytes, { digits = 1 } = {}) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new RangeError(`bytes must be a non-negative finite number, got ${bytes}`);
  }
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < DECIMAL_UNITS.length - 1) {
    value /= 1000;
    unit += 1;
  }
  const text = unit === 0 ? String(value) : value.toFixed(digits);
  return `${text} ${DECIMAL_UNITS[unit]}`;
}
