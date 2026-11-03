import { InvoiceCache } from './cache.js';

export function invoiceTotalCents(invoice) {
  return invoice.lineItems.reduce((sum, item) => sum + item.quantity * item.unitCents, 0);
}

export function summarize(invoice) {
  const totalCents = invoiceTotalCents(invoice);
  return { ...invoice, totalCents, balanceCents: totalCents - invoice.paidCents };
}

export class InvoiceService {
  constructor(store, cache = new InvoiceCache()) {
    this.store = store;
    this.cache = cache;
  }

  getInvoice(id) {
    const cached = this.cache.get(id);
    if (cached) return cached;
    const invoice = this.store.get(id);
    if (!invoice) return undefined;
    const summary = summarize(invoice);
    this.cache.set(id, summary);
    return summary;
  }

  listInvoices() {
    return this.store.all().map(summarize);
  }
}
