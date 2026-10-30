export function lineTotal(line) {
  if (!Number.isInteger(line.qty) || line.qty < 1) {
    throw new RangeError(`invalid quantity for ${line.sku}`);
  }
  return line.qty * line.unitCents;
}

export function subtotal(lines) {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

export function orderTotal(lines) {
  return subtotal(lines);
}
