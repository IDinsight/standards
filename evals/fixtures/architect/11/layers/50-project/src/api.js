import { NotFoundError, StateError, ValidationError } from './errors.js';
import { createDraft, dueDate, getInvoice, issueInvoice, totalCents, voidInvoice } from './invoices.js';
import { balanceCents, recordPayment } from './payments.js';

function view(store, invoice) {
  return {
    ...invoice,
    lines: invoice.lines.map((line) => ({ ...line })),
    totalCents: totalCents(invoice),
    dueDate: dueDate(invoice),
    balanceCents: balanceCents(store, invoice.number),
  };
}

const routes = [
  ['POST', /^\/invoices$/, ({ store, body, today }) => [201, view(store, createDraft(store, body, today))]],
  ['GET', /^\/invoices\/([^/]+)$/, ({ store }, number) => [200, view(store, getInvoice(store, number))]],
  ['POST', /^\/invoices\/([^/]+)\/issue$/, ({ store, today }, number) => [200, view(store, issueInvoice(store, number, today))]],
  ['POST', /^\/invoices\/([^/]+)\/void$/, ({ store }, number) => [200, view(store, voidInvoice(store, number))]],
  ['POST', /^\/invoices\/([^/]+)\/payments$/, ({ store, body, today }, number) => {
    recordPayment(store, number, body.amountCents, today);
    return [201, view(store, getInvoice(store, number))];
  }],
];

export function handle(store, clock, method, path, body = {}) {
  const today = clock().toISOString().slice(0, 10);
  for (const [verb, pattern, action] of routes) {
    const match = pattern.exec(path);
    if (!match || verb !== method) continue;
    try {
      const [status, payload] = action({ store, body, today }, ...match.slice(1).map(decodeURIComponent));
      return { status, body: payload };
    } catch (error) {
      if (error instanceof NotFoundError) return { status: 404, body: { error: error.message } };
      if (error instanceof ValidationError) return { status: 400, body: { error: error.message } };
      if (error instanceof StateError) return { status: 409, body: { error: error.message } };
      throw error;
    }
  }
  return { status: 404, body: { error: 'no such route' } };
}
