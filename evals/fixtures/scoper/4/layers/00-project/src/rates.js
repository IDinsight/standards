const ZONE_RATES = {
  domestic: { base: 590, perKg: 85 },
  regional: { base: 890, perKg: 120 },
  international: { base: 1750, perKg: 310 },
};

export const zones = Object.keys(ZONE_RATES);

export function quote({ zone, weightKg }) {
  const rate = ZONE_RATES[zone];
  if (!rate) throw new RangeError(`unknown zone: ${zone}`);
  if (!(weightKg > 0)) throw new RangeError('weightKg must be positive');
  const kg = Math.ceil(weightKg);
  const lines = [
    { label: 'Base rate', amount: rate.base },
    { label: `Weight (${kg} kg)`, amount: rate.perKg * kg },
  ];
  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  return { zone, weightKg, lines, total };
}
