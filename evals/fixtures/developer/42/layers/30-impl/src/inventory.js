// Parse comma-separated inventory rows: sku, name, quantity[, reorder_at].
export function parseItem(row) {
  const [sku, name, qty, reorder] = row.split(',').map((part) => part.trim());
  const quantity = Number(qty);
  if (!sku || !name || !Number.isInteger(quantity) || quantity < 0) {
    throw new Error(`invalid inventory row: ${row}`);
  }
  let reorderAt = null;
  if (reorder !== undefined && reorder !== '') {
    reorderAt = Number(reorder);
    if (!Number.isInteger(reorderAt) || reorderAt < 0) {
      throw new Error(`invalid reorder threshold: ${row}`);
    }
  }
  return { sku, name, quantity, reorderAt };
}

export function isLowStock(item) {
  return typeof item.reorderAt === 'number' && item.quantity <= item.reorderAt;
}

export function parseInventory(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map(parseItem);
}
