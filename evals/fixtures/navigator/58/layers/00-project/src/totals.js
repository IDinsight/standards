export function lineTotalCents({ unitPriceCents, quantity }) {
  if (!Number.isInteger(unitPriceCents) || unitPriceCents < 0) {
    throw new RangeError('unitPriceCents must be a non-negative integer');
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new RangeError('quantity must be a positive integer');
  }
  return unitPriceCents * quantity;
}

export function applyDiscount(subtotalCents, discount) {
  if (!discount) return subtotalCents;
  if (discount.type === 'percent') {
    return subtotalCents - Math.round((subtotalCents * discount.value) / 100);
  }
  if (discount.type === 'fixed') {
    return Math.max(0, subtotalCents - discount.valueCents);
  }
  throw new TypeError(`unknown discount type: ${discount.type}`);
}

export function invoiceTotal(items, { discount, taxRate = 0 } = {}) {
  const subtotal = items.reduce((sum, item) => sum + lineTotalCents(item), 0);
  const discounted = applyDiscount(subtotal, discount);
  const tax = Math.round(discounted * taxRate);
  return { subtotal, discounted, tax, total: discounted + tax };
}
