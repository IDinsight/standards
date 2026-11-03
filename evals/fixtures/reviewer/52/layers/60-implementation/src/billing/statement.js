import { outstandingCents } from './invoices.js';
import { lateFeeCents } from './lateFee.js';

export function buildStatement(customer, invoices, statementDate) {
  const lines = invoices
    .filter((invoice) => outstandingCents(invoice) > 0)
    .map((invoice) => ({
      number: invoice.number,
      dueDate: invoice.dueDate,
      outstandingCents: outstandingCents(invoice),
      lateFeeCents: lateFeeCents(invoice),
    }));
  const totalCents = lines.reduce((sum, line) => sum + line.outstandingCents + line.lateFeeCents, 0);
  return { customer: customer.name, statementDate, lines, totalCents };
}
