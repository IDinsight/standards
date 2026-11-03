import { couponPercent } from './coupons.js';

export function lineTotal(line) {
  if (!Number.isInteger(line.qty) || line.qty < 1) {
    throw new RangeError(`invalid quantity for ${line.sku}`);
  }
  return line.qty * line.unitCents;
}

export function subtotal(lines) {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

// Discount in whole cents for a percentage of an amount.
export function discountCents(amount, percent) {
  return Math.floor((amount * percent) / 100);
}

export function orderTotal(lines, couponCode) {
  const amount = subtotal(lines);
  if (!couponCode) return amount;
  return amount - discountCents(amount, couponPercent(couponCode));
}
