// Prices are integer cents throughout.

export function lineTotal(line) {
  return line.unitCents * line.quantity;
}

export function orderTotal(lines) {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}
