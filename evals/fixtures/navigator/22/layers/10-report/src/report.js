import { invoiceTotals } from './totals.js';

export function summaryLines(invoices, settings) {
  return invoices.map((invoice) => {
    const { total } = invoiceTotals(invoice, settings.taxRate);
    return `${invoice.number}  ${invoice.customer}  ${total.toFixed(2)}`;
  });
}
