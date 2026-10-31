import { daysOverdue, outstandingCents } from './invoices.js';

export const GRACE_DAYS = 14;
// 1.5% expressed per thousand so the fee stays in integer cents.
const RATE_PER_THOUSAND = 15;

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function lateFeeCents(invoice, asOf = today()) {
  const outstanding = outstandingCents(invoice);
  if (outstanding === 0 || daysOverdue(invoice, asOf) <= GRACE_DAYS) return 0;
  return Math.floor((outstanding * RATE_PER_THOUSAND + 500) / 1000);
}
