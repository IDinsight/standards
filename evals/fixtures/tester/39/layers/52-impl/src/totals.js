import { lookupDiscount } from './discounts.js';

const TAX_RATE = 0.08;

function cents(amount) {
  return Math.round(amount * 100) / 100;
}

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}

export function orderTotals(items, { discountCode = null, today = currentDate() } = {}) {
  const percent = discountCode === null ? 0 : lookupDiscount(discountCode, today);
  const subtotal = cents(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const discount = cents((subtotal * percent) / 100);
  const taxable = cents(subtotal - discount);
  const tax = cents(taxable * TAX_RATE);
  return { subtotal, discount, tax, total: cents(taxable + tax) };
}
