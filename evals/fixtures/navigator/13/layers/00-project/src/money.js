// Money helpers. Amounts are integer cents; rates are basis points.

export function formatCents(cents, currency = 'USD') {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}${currency} ${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}

export function percentOf(cents, basisPoints) {
  return Math.round((cents * basisPoints) / 10000);
}
