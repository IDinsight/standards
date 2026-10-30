// Amounts are plain numbers in the invoice currency.

export function lineTotal(line) {
  return line.quantity * line.unitPrice;
}

export function invoiceTotal(lines) {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

export function formatAmount(amount) {
  return amount.toFixed(2);
}
