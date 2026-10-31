const BASE = { domestic: 4.5, regional: 7.25, international: 15 };
const PER_KG = { domestic: 1.1, regional: 1.6, international: 3.4 };

function roundToCents(value) {
  return Math.round(value * 100) / 100;
}

export function shippingCost({ zone, weightKg }) {
  if (!Object.hasOwn(BASE, zone)) throw new RangeError(`unknown zone: ${zone}`);
  if (!(weightKg > 0)) throw new RangeError('weightKg must be greater than 0');
  return roundToCents(BASE[zone] + PER_KG[zone] * Math.ceil(weightKg));
}
