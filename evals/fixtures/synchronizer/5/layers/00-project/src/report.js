import { summaryLine } from './summary.js';

export function monthlyReport(invoices) {
  return invoices.map(summaryLine).join('\n');
}
