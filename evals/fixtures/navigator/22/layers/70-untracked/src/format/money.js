// Display of invoice amounts held in the currency's minor unit.
const DEFAULT_CURRENCY = { code: 'USD', decimals: 2 };

export function resolveCurrency(currency) {
  return { ...DEFAULT_CURRENCY, ...(currency ?? {}) };
}

function group(digits) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatMoney(minor, currency) {
  const { code, decimals } = resolveCurrency(currency);
  const unit = 10 ** decimals;
  const abs = Math.abs(minor);
  const whole = group(String(Math.floor(abs / unit)));
  const fraction = decimals > 0 ? `.${String(abs % unit).padStart(decimals, '0')}` : '';
  return `${minor < 0 ? '-' : ''}${code} ${whole}${fraction}`;
}
