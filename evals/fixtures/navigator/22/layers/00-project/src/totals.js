export function lineAmount(line) {
  return line.quantity * line.unitPrice;
}

export function invoiceTotals(invoice, taxRate) {
  const subtotal = invoice.lines.reduce((sum, line) => sum + lineAmount(line), 0);
  const tax = subtotal * taxRate;
  return { subtotal, tax, total: subtotal + tax };
}
