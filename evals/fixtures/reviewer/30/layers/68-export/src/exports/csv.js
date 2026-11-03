const HEADER = ['invoice_id', 'customer', 'amount', 'issued_on'];

// RFC 4180: a field containing a comma, double quote, CR, or LF is enclosed in
// double quotes, and every double quote inside it is doubled.
function cell(value) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// 125000 -> '1250.00'. Amounts are positive whole cents.
export function formatAmount(cents) {
  return `${Math.trunc(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
}

// Header row, then one row per invoice in the given order. Every row ends with CRLF.
export function toCsv(invoices) {
  const rows = invoices.map((invoice) => [invoice.id, invoice.customer, formatAmount(invoice.amountCents), invoice.issuedOn]);
  return [HEADER, ...rows].map((row) => `${row.map(cell).join(',')}\r\n`).join('');
}
