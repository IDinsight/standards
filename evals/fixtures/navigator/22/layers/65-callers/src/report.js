import { formatMoney, resolveCurrency } from './format/money.js';
import { invoiceTotalsMinor } from './totals.js';

export function summaryLines(invoices, settings) {
  const currency = resolveCurrency(settings.currency);
  return invoices.map((invoice) => {
    const { total } = invoiceTotalsMinor(invoice, settings.taxRate, currency.decimals);
    return `${invoice.number}  ${invoice.customer}  ${formatMoney(total, currency)}`;
  });
}
