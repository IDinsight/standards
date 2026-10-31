// Quantity discount tiers, highest threshold first.
export const TIERS = [
  { minQuantity: 100, rate: 0.15 },
  { minQuantity: 50, rate: 0.1 },
  { minQuantity: 10, rate: 0.05 },
];

export function discountRate(quantity) {
  const tier = TIERS.find((candidate) => quantity >= candidate.minQuantity);
  return tier ? tier.rate : 0;
}
