const DECIMAL = { base: 1000, units: ['B', 'kB', 'MB', 'GB', 'TB'] };
const BINARY = { base: 1024, units: ['B', 'KiB', 'MiB', 'GiB', 'TiB'] };

export function formatBytes(bytes, { digits = 1, binary = false } = {}) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new RangeError(`bytes must be a non-negative finite number, got ${bytes}`);
  }
  const { base, units } = binary ? BINARY : DECIMAL;
  let value = bytes;
  let unit = 0;
  while (value >= base && unit < units.length - 1) {
    value /= base;
    unit += 1;
  }
  const text = unit === 0 ? String(value) : value.toFixed(digits);
  return `${text} ${units[unit]}`;
}
