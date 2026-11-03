import { StateError, ValidationError } from './errors.js';
import { getInvoice, totalCents } from './invoices.js';

export function paymentsFor(store, number) {
  return store.payments.filter((payment) => payment.invoiceNumber === number);
}

export function balanceCents(store, number) {
  const invoice = getInvoice(store, number);
  const paid = paymentsFor(store, number).reduce((sum, payment) => sum + payment.amountCents, 0);
  return totalCents(invoice) - paid;
}

export function recordPayment(store, number, amountCents, date) {
  const invoice = getInvoice(store, number);
  if (invoice.status !== 'issued') throw new StateError('invoice ' + number + ' is ' + invoice.status);
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new ValidationError('amountCents must be a positive integer');
  }
  if (amountCents > balanceCents(store, number)) throw new ValidationError('payment exceeds balance');
  const payment = { invoiceNumber: number, amountCents, date };
  store.payments.push(payment);
  if (balanceCents(store, number) === 0) invoice.status = 'paid';
  return payment;
}
