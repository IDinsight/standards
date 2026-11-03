import { roundCents } from './money.js';

export function subtotal(order) {
  return roundCents(order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));
}

export function shippingCost(order, settings) {
  const threshold = settings.freeShippingThreshold ?? null;
  if (threshold !== null && subtotal(order) >= threshold) return 0;
  const weight = order.items.reduce((sum, item) => sum + item.weightKg * item.quantity, 0);
  if (weight === 0) return 0;
  return roundCents(settings.baseRate + settings.perKg * Math.ceil(weight));
}
