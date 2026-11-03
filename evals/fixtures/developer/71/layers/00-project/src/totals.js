export function lineTotal(line) {
  return line.quantity * line.unitPriceCents;
}

export function computeTotals(lines, { taxRate = 0 } = {}) {
  const subtotal = lines.reduce((sum, line) => sum + lineTotal(line), 0);
  const tax = Math.round(subtotal * taxRate);
  return { subtotal, tax, total: subtotal + tax };
}
