// Invoice amounts are in major currency units (for example dollars, not cents).

export function lineTotal(line) {
  return line.quantity * line.unitPrice;
}

export function invoiceTotal(invoice) {
  return invoice.lines.reduce((sum, line) => sum + lineTotal(line), 0);
}
