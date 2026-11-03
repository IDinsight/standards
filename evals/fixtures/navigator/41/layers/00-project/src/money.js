// Amounts are stored as integer cents; format them without floating-point math.
export function formatCents(cents) {
  if (!Number.isInteger(cents)) throw new TypeError(`expected integer cents, got ${cents}`);
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}
