import { randomBytes } from 'node:crypto';
import type { Invoice, InvoiceStore } from './invoices.ts';

export type ShareLink = { token: string; invoiceId: string };

export class ShareLinks {
  #store: InvoiceStore;
  #links = new Map<string, ShareLink>();

  constructor(store: InvoiceStore) {
    this.#store = store;
  }

  create(invoiceId: string): ShareLink {
    if (!this.#store.get(invoiceId)) throw new Error('unknown invoice ' + invoiceId);
    const link: ShareLink = { token: randomBytes(16).toString('hex'), invoiceId };
    this.#links.set(link.token, link);
    return link;
  }

  resolve(token: string): Invoice | undefined {
    const link = this.#links.get(token);
    return link ? this.#store.get(link.invoiceId) : undefined;
  }
}
