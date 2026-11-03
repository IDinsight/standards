const ZONES = {
  domestic: { base: 4.5, perKg: 1.2 },
  regional: { base: 7.0, perKg: 2.1 },
  international: { base: 15.0, perKg: 4.75 },
};

export function zones() {
  return Object.keys(ZONES);
}

export function quote(weightKg, zone) {
  const rate = ZONES[zone];
  if (!rate) throw new Error(`unknown zone: ${zone}`);
  if (!(weightKg > 0)) throw new Error('weight must be positive');
  const billable = Math.ceil(weightKg * 2) / 2;
  return Math.round((rate.base + rate.perKg * billable) * 100) / 100;
}
