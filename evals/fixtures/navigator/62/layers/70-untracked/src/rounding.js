// Round a currency amount to whole cents.
export function roundCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
