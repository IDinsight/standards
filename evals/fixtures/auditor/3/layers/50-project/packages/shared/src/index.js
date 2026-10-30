export function toCents(amount) {
  return Math.round(Number(amount) * 100);
}

export function formatCents(cents, currency = 'USD') {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const units = Math.floor(abs / 100);
  const rest = String(abs % 100).padStart(2, '0');
  return sign + currency + ' ' + units + '.' + rest;
}

export function sumCents(values) {
  return values.reduce((total, value) => total + value, 0);
}
