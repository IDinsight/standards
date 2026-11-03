const COLUMNS = ['id', 'customer', 'issued_at', 'amount_cents', 'currency', 'status'];

function cell(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function invoicesToCsv(invoices) {
  const rows = invoices.map((invoice) => [
    invoice.id,
    invoice.customer,
    invoice.issuedAt.toISOString(),
    invoice.amountCents,
    invoice.currency,
    invoice.status,
  ].map(cell).join(','));
  return `${[COLUMNS.join(','), ...rows].join('\n')}\n`;
}
