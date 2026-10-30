import { randomBytes } from 'node:crypto';
import type { Invoice, InvoiceStore } from './invoices.ts';

export type ShareLink = { token: string; invoiceId: string; expiresAt: number; revoked: boolean };

export const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class ShareLinks {
  #store: InvoiceStore;
  #links = new Map<string, ShareLink>();

  constructor(store: InvoiceStore) {
    this.#store = store;
  }

  create(invoiceId: string, now: number, ttlMs: number = DEFAULT_TTL_MS): ShareLink {
    if (!this.#store.get(invoiceId)) throw new Error('unknown invoice ' + invoiceId);
    const link: ShareLink = {
      token: randomBytes(16).toString('hex'),
      invoiceId,
      expiresAt: now + ttlMs,
      revoked: false,
    };
    this.#links.set(link.token, link);
    return link;
  }

  resolve(token: string, now: number): Invoice | undefined {
    const link = this.#links.get(token);
    if (!link || link.revoked || now >= link.expiresAt) return undefined;
    return this.#store.get(link.invoiceId);
  }

  revoke(token: string): boolean {
    const link = this.#links.get(token);
    if (!link || link.revoked) return false;
    link.revoked = true;
    return true;
  }
}
