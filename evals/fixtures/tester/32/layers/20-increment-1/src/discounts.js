import { subtotalCents } from './invoice.js';
import { roundCents } from './money.js';

export class DiscountError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'DiscountError';
    this.code = code;
  }
}

// Catalog keys are upper-case codes; entries look like
// { kind: 'percent', percent: 15, expires: '2026-10-31' } or
// { kind: 'fixed', amountCents: 500, expires: null }.
export function lookupCode(catalog, code, today) {
  const key = String(code).trim().toUpperCase();
  const entry = catalog.get(key);
  if (!entry) {
    throw new DiscountError('UNKNOWN_CODE', 'unknown discount code: ' + code);
  }
  if (entry.expires && today > entry.expires) {
    throw new DiscountError('EXPIRED_CODE', 'discount code ' + key + ' expired on ' + entry.expires);
  }
  return { code: key, ...entry };
}

function discountAmount(invoice, entry) {
  if (entry.kind === 'percent') {
    return roundCents((subtotalCents(invoice) * entry.percent) / 100);
  }
  throw new DiscountError('UNSUPPORTED_KIND', 'unsupported discount kind: ' + entry.kind);
}

export function applyDiscount(invoice, code, catalog, today) {
  if (invoice.discount) {
    throw new DiscountError('ALREADY_DISCOUNTED', 'invoice already has a discount code');
  }
  const entry = lookupCode(catalog, code, today);
  const amountCents = discountAmount(invoice, entry);
  return Object.freeze({
    ...invoice,
    discount: Object.freeze({ code: entry.code, kind: entry.kind, amountCents }),
  });
}
