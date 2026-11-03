const BASE = { domestic: 4.5, regional: 7.25, international: 15 };
const PER_KG = { domestic: 1.1, regional: 1.6, international: 3.4 };
const FREE_SHIPPING_ZONES = new Set(['domestic', 'regional']);

function roundToCents(value) {
  return Math.round(value * 100) / 100;
}

export function shippingCost(order, options = {}) {
  const { zone, weightKg, orderTotal = 0 } = order;
  if (!Object.hasOwn(BASE, zone)) throw new RangeError(`unknown zone: ${zone}`);
  if (!(weightKg > 0)) throw new RangeError('weightKg must be greater than 0');
  const { freeShippingThreshold } = options;
  if (freeShippingThreshold !== undefined) {
    if (!Number.isFinite(freeShippingThreshold) || freeShippingThreshold < 0) {
      throw new RangeError('freeShippingThreshold must be a non-negative number');
    }
    if (FREE_SHIPPING_ZONES.has(zone) && orderTotal >= freeShippingThreshold) return 0;
  }
  return roundToCents(BASE[zone] + PER_KG[zone] * Math.ceil(weightKg));
}
