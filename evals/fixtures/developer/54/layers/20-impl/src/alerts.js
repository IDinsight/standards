// Items that have reached their reorder level, in SKU order. Items with a
// reorder level of 0 are not tracked for reordering.
export function lowStock(items) {
  return items
    .filter((item) => item.reorderLevel > 0 && item.quantity <= item.reorderLevel)
    .sort((a, b) => (a.sku < b.sku ? -1 : a.sku > b.sku ? 1 : 0));
}
