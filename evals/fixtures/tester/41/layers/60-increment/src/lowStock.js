// Items at or below their reorder level, lowest quantity first.
export function lowStockItems(items) {
  return items
    .filter((item) => item.quantity <= item.reorderLevel)
    .sort((a, b) => a.quantity - b.quantity || a.sku.localeCompare(b.sku));
}
