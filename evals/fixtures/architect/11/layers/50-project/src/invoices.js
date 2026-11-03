import { NotFoundError, StateError, ValidationError } from './errors.js';
import { nextInvoiceNumber } from './numbering.js';

function normalizeLine(line) {
  const quantity = Number(line.quantity);
  const unitPriceCents = Number(line.unitPriceCents);
  if (!line.description || !Number.isInteger(quantity) || quantity <= 0
      || !Number.isInteger(unitPriceCents) || unitPriceCents < 0) {
    throw new ValidationError('invalid line item');
  }
  return { description: String(line.description), quantity, unitPriceCents };
}

export function createDraft(store, input = {}, today) {
  if (!input.customerId) throw new ValidationError('customerId is required');
  const termsDays = input.termsDays ?? 30;
  if (!Number.isInteger(termsDays) || termsDays < 0) {
    throw new ValidationError('termsDays must be a non-negative integer');
  }
  const invoice = {
    number: nextInvoiceNumber(store, today.slice(0, 4)),
    customerId: input.customerId,
    status: 'draft',
    issueDate: today,
    termsDays,
    lines: (input.lines ?? []).map(normalizeLine),
  };
  store.invoices.set(invoice.number, invoice);
  return invoice;
}

export function getInvoice(store, number) {
  const invoice = store.invoices.get(number);
  if (!invoice) throw new NotFoundError('invoice ' + number + ' not found');
  return invoice;
}

export function issueInvoice(store, number, today) {
  const invoice = getInvoice(store, number);
  if (invoice.status !== 'draft') throw new StateError('invoice ' + number + ' is ' + invoice.status);
  if (invoice.lines.length === 0) throw new StateError('invoice ' + number + ' has no lines');
  invoice.status = 'issued';
  invoice.issueDate = today;
  return invoice;
}

export function voidInvoice(store, number) {
  const invoice = getInvoice(store, number);
  if (invoice.status === 'paid' || invoice.status === 'void') {
    throw new StateError('invoice ' + number + ' is ' + invoice.status);
  }
  invoice.status = 'void';
  return invoice;
}

export function totalCents(invoice) {
  return invoice.lines.reduce((sum, line) => sum + line.quantity * line.unitPriceCents, 0);
}

export function dueDate(invoice) {
  const date = new Date(invoice.issueDate + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + invoice.termsDays);
  return date.toISOString().slice(0, 10);
}
