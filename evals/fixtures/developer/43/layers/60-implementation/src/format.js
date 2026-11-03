export function formatAmount(cents, currency = '$') {
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, '0');
  const body = `${currency}${groupThousands(whole)}.${frac}`;
  return cents < 0 ? `(${body})` : body;
}

function groupThousands(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
