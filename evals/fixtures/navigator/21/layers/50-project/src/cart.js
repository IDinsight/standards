export function lineTotal(item) {
  return item.unitPrice * item.quantity;
}

export function subtotal(items) {
  return items.reduce((sum, item) => sum + lineTotal(item), 0);
}
