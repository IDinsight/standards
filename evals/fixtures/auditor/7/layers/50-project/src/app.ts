import { InvoiceStore } from './invoices.ts';
import type { Context } from './handlers.ts';

export function createContext(): Context {
  return { store: new InvoiceStore() };
}
