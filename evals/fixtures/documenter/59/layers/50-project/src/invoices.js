const INVOICES = [
  { id: 'INV-1001', customer: 'Northwind Traders', issuedAt: new Date('2026-08-03T14:20:00Z'), amountCents: 125000, currency: 'USD', status: 'paid' },
  { id: 'INV-1002', customer: 'Lindqvist, Berg & Co', issuedAt: new Date('2026-08-17T09:05:00Z'), amountCents: 48050, currency: 'USD', status: 'open' },
  { id: 'INV-1003', customer: 'Ostrava Tooling', issuedAt: new Date('2026-09-02T16:45:00Z'), amountCents: 9900, currency: 'EUR', status: 'open' },
  { id: 'INV-1004', customer: 'Northwind Traders', issuedAt: new Date('2026-09-15T11:00:00Z'), amountCents: 310075, currency: 'USD', status: 'void' },
];

export function listInvoices({ status } = {}) {
  return INVOICES.filter((invoice) => status === undefined || invoice.status === status);
}

export function findInvoice(id) {
  return INVOICES.find((invoice) => invoice.id === id) ?? null;
}
