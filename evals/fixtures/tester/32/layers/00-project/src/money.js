export function toCents(amount) {
  if (typeof amount !== 'string' || !/^\d+(\.\d{1,2})?$/.test(amount)) {
    throw new TypeError('invalid amount: ' + amount);
  }
  const [whole, fraction = ''] = amount.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}

export function formatCents(cents) {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return sign + Math.floor(abs / 100) + '.' + String(abs % 100).padStart(2, '0');
}

// Round a fractional number of cents to a whole cent, halves away from zero.
export function roundCents(value) {
  return Math.sign(value) * Math.round(Math.abs(value));
}
