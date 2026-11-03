export type InvoiceStatus = 'draft' | 'sent' | 'paid';

export type Invoice = {
  id: string;
  customer: string;
  amountCents: number;
  issuedOn: string;
  status: InvoiceStatus;
};

export type NewInvoice = { customer: string; amountCents: number; issuedOn: string };

export class InvoiceStore {
  #items = new Map<string, Invoice>();
  #next = 1;

  create(input: NewInvoice): Invoice {
    const id = 'INV-' + String(this.#next).padStart(4, '0');
    this.#next += 1;
    const invoice: Invoice = { id, status: 'draft', ...input };
    this.#items.set(id, invoice);
    return invoice;
  }

  get(id: string): Invoice | undefined {
    return this.#items.get(id);
  }

  list(): Invoice[] {
    return [...this.#items.values()];
  }

  markSent(id: string): Invoice {
    return this.#transition(id, 'draft', 'sent');
  }

  markPaid(id: string): Invoice {
    return this.#transition(id, 'sent', 'paid');
  }

  #transition(id: string, from: InvoiceStatus, to: InvoiceStatus): Invoice {
    const invoice = this.#items.get(id);
    if (!invoice) throw new Error('unknown invoice ' + id);
    if (invoice.status !== from) throw new Error('invoice ' + id + ' is ' + invoice.status + ', not ' + from);
    invoice.status = to;
    return invoice;
  }
}
