// Prices are integer cents throughout.

// Ordered from the highest threshold so the first match wins.
const TIERS = [
  { minQuantity: 50, rate: 0.1 },
  { minQuantity: 10, rate: 0.05 },
];

export function discountRate(quantity) {
  const tier = TIERS.find((candidate) => quantity >= candidate.minQuantity);
  return tier ? tier.rate : 0;
}

export function lineDiscount(line) {
  return Math.round(line.unitCents * line.quantity * discountRate(line.quantity));
}

export function lineTotal(line) {
  return line.unitCents * line.quantity - lineDiscount(line);
}

export function orderTotal(lines) {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}
