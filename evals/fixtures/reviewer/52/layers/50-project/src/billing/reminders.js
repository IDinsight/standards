import { daysOverdue, isPaid } from './invoices.js';

export const REMINDER_AFTER_DAYS = 7;

export function invoicesNeedingReminder(invoices, asOf) {
  return invoices
    .filter((invoice) => !isPaid(invoice) && daysOverdue(invoice, asOf) >= REMINDER_AFTER_DAYS)
    .map((invoice) => invoice.number);
}
