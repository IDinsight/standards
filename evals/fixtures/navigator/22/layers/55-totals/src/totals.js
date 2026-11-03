export function lineAmount(line) {
  return line.quantity * line.unitPrice;
}

export function invoiceTotals(invoice, taxRate) {
  const subtotal = invoice.lines.reduce((sum, line) => sum + lineAmount(line), 0);
  const tax = subtotal * taxRate;
  return { subtotal, tax, total: subtotal + tax };
}

// Amounts in the currency's minor unit (cents for 2 decimals), so sums and
// tax do not pick up floating-point remainders.
export function toMinor(amount, decimals = 2) {
  return Math.round(amount * 10 ** decimals);
}

export function invoiceTotalsMinor(invoice, taxRate, decimals = 2) {
  const subtotal = invoice.lines.reduce((sum, line) => sum + toMinor(lineAmount(line), decimals), 0);
  const tax = Math.round(subtotal * taxRate);
  return { subtotal, tax, total: subtotal + tax };
}
