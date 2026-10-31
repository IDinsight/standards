export function lineTotalCents(item) {
  return item.unitPriceCents * item.quantity;
}

export function orderTotals(order) {
  const subtotalCents = order.items.reduce((sum, item) => sum + lineTotalCents(item), 0);
  const taxCents = Math.round(subtotalCents * order.taxRate);
  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}
