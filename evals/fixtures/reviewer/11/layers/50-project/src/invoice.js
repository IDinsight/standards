import { invoiceTotal } from './totals.js';

export function summarize(invoice) {
  return {
    number: invoice.number,
    currency: invoice.currency,
    lineCount: invoice.lines.length,
    total: invoiceTotal(invoice),
  };
}
