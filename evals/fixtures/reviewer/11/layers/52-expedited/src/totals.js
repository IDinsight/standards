// Invoice amounts are in major currency units (for example dollars, not cents).

function toCents(amount) {
  return Math.round(amount * 100) / 100;
}

export function lineTotal(line) {
  return toCents(line.quantity * line.unitPrice);
}

export function invoiceTotal(invoice) {
  return toCents(invoice.lines.reduce((sum, line) => sum + lineTotal(line), 0));
}
