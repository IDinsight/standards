const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

// Whole days after the due date; 0 on or before it.
export function daysOverdue(invoice, asOf) {
  const diff = parseDate(asOf) - parseDate(invoice.dueDate);
  return diff > 0 ? Math.floor(diff / DAY_MS) : 0;
}

export function outstandingCents(invoice) {
  const paid = invoice.payments.reduce((sum, payment) => sum + payment.amountCents, 0);
  return Math.max(invoice.totalCents - paid, 0);
}

export function isPaid(invoice) {
  return outstandingCents(invoice) === 0;
}
