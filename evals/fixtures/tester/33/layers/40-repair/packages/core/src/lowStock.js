export const DEFAULT_REORDER_AT = 5;

export function reorderPoint(item) {
  return item.reorderAt ?? DEFAULT_REORDER_AT;
}

export function isLowStock(item) {
  return item.quantity <= reorderPoint(item);
}

export function lowStock(items) {
  return items
    .filter(isLowStock)
    .map((item) => ({ sku: item.sku, quantity: item.quantity, reorderAt: reorderPoint(item) }));
}
