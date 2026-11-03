import { insertInvoice } from './repository.js';

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseInvoice(input) {
  const customer = typeof input.customer === 'string' ? input.customer.trim() : '';
  if (!customer) throw new ValidationError('customer is required');
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new ValidationError('amountCents must be a positive whole number of cents');
  }
  if (typeof input.issuedOn !== 'string' || !DATE.test(input.issuedOn)) {
    throw new ValidationError('issuedOn must be a YYYY-MM-DD date');
  }
  return { customer, amountCents: input.amountCents, issuedOn: input.issuedOn };
}

export async function recordInvoice(db, input) {
  const invoice = parseInvoice(input);
  const id = await insertInvoice(db, invoice);
  return { id, ...invoice };
}
