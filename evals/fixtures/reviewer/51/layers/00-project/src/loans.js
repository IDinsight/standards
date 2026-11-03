import { daysBetween } from './dates.js';

// A loan: { id, borrower: { name, email }, title, due: 'YYYY-MM-DD', returned: 'YYYY-MM-DD' | null }

export function daysOverdue(loan, today) {
  if (loan.returned) return 0;
  return Math.max(0, daysBetween(loan.due, today));
}

export function isOverdue(loan, today) {
  return daysOverdue(loan, today) > 0;
}
