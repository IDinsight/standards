// Render integer cents as a decimal amount with two places, e.g. 1550 -> "15.50".
export function formatCents(cents) {
  const sign = cents < 0 ? '-' : '';
  const value = Math.abs(cents);
  return sign + Math.floor(value / 100) + '.' + String(value % 100).padStart(2, '0');
}
