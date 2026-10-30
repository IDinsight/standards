import { InvoiceStore } from './invoices.ts';
import { ShareLinks } from './share-links.ts';
import type { Context } from './handlers.ts';

export function createContext(): Context {
  const store = new InvoiceStore();
  return { store, links: new ShareLinks(store), now: Date.now };
}
