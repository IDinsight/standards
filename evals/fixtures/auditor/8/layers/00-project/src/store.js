export class InvoiceStore {
  constructor(invoices = []) {
    this.rows = new Map(invoices.map((invoice) => [invoice.id, structuredClone(invoice)]));
    this.reads = 0;
  }

  get(id) {
    this.reads += 1;
    const row = this.rows.get(id);
    return row ? structuredClone(row) : undefined;
  }

  put(invoice) {
    this.rows.set(invoice.id, structuredClone(invoice));
  }

  all() {
    return [...this.rows.values()].map((row) => structuredClone(row));
  }
}
