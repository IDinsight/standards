export function lineTotal(line) {
  return line.quantity * line.unitPriceCents;
}

export function computeTotals(lines, { taxRate = 0, discountCents = 0 } = {}) {
  const subtotal = lines.reduce((sum, line) => sum + lineTotal(line), 0);
  if (!Number.isInteger(discountCents) || discountCents < 0 || discountCents > subtotal) {
    throw new RangeError(`discount must be between 0 and ${subtotal} cents`);
  }
  const taxable = subtotal - discountCents;
  const tax = Math.round(taxable * taxRate);
  return { subtotal, discount: discountCents, tax, total: taxable + tax };
}
