export function normalizeCode(code) {
  return String(code).trim().toUpperCase();
}

export function findDiscount(code, codes) {
  const wanted = normalizeCode(code);
  return codes.find((entry) => entry.code === wanted) ?? null;
}

export function discountAmount(discount, subtotal) {
  if (discount.type === 'percent') return Math.round((subtotal * discount.value) / 100);
  if (discount.type === 'fixed') return Math.min(discount.value, subtotal);
  throw new RangeError(`unknown discount type ${discount.type}`);
}
