import { sumCents } from '@tally/shared';

import { planPrice } from './plans.js';

export function createInvoice({ customerId, planId, issuedOn }) {
  const lines = [{ description: 'Plan ' + planId, cents: planPrice(planId) }];
  return {
    customerId,
    issuedOn,
    lines,
    totalCents: sumCents(lines.map((line) => line.cents)),
  };
}

export function postInvoice(ledger, invoice) {
  ledger.post('receivable:' + invoice.customerId, invoice.totalCents, 'invoice ' + invoice.issuedOn);
}
