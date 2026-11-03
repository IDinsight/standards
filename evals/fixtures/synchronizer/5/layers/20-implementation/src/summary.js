// Totals and one-line summaries for invoices.
// An invoice is { number, currency, lines: [{ quantity, unitPrice }] }.

export function invoiceTotal(lines) {
  return lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
}

export function summaryLine(invoice) {
  const total = invoiceTotal(invoice.lines).toFixed(2);
  return invoice.number + ': ' + invoice.lines.length + ' item(s), total ' + invoice.currency + ' ' + total;
}
