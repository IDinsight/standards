import { sumCents } from '@tally/shared';

import { planPrice } from './plans.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// Dates are ISO YYYY-MM-DD strings; do the arithmetic at UTC midnight so the
// host time zone cannot shift the result.
function addDays(isoDate, days) {
  const start = Date.parse(isoDate + 'T00:00:00Z');
  return new Date(start + days * DAY_MS).toISOString().slice(0, 10);
}

export function createInvoice({ customerId, planId, issuedOn, termsDays = 30 }) {
  const lines = [{ description: 'Plan ' + planId, cents: planPrice(planId) }];
  return {
    customerId,
    issuedOn,
    dueOn: addDays(issuedOn, termsDays),
    lines,
    totalCents: sumCents(lines.map((line) => line.cents)),
  };
}

export function postInvoice(ledger, invoice) {
  ledger.post('receivable:' + invoice.customerId, invoice.totalCents, 'invoice ' + invoice.issuedOn);
}
