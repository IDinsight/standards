/** Items whose quantity is below their reorder point, lowest quantity first. */
export function lowStock(items) {
  return items
    .filter((item) => item.qty < item.reorderAt)
    .sort((a, b) => a.qty - b.qty || a.sku.localeCompare(b.sku));
}
