export function formatAmount(cents) {
  return '$' + (cents / 100).toFixed(2);
}

export function formatTotal(cents, currency) {
  return (cents / 100).toFixed(2) + ' ' + currency;
}

export function invoiceTotal(invoice) {
  return invoice.lines.reduce((sum, line) => sum + line.quantity * line.unitCents, 0);
}

export function renderInvoice(invoice) {
  const lines = invoice.lines.map(
    (line) => line.description + ' x' + line.quantity + '  ' + formatAmount(line.quantity * line.unitCents),
  );
  return [
    'Invoice ' + invoice.id,
    'Bill to: ' + invoice.customer,
    ...lines,
    'Total: ' + formatTotal(invoiceTotal(invoice), invoice.currency),
  ].join('\n');
}
