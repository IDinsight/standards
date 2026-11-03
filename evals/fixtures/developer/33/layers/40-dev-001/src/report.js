export function lowStock(items, threshold) {
  if (!Number.isInteger(threshold) || threshold < 0) {
    throw new RangeError('threshold must be a non-negative integer');
  }
  return items
    .filter((item) => item.quantity < threshold)
    .sort((a, b) => a.quantity - b.quantity || a.sku.localeCompare(b.sku));
}
