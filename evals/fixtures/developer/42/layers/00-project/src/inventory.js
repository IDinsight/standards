// Parse comma-separated inventory rows: sku, name, quantity.
export function parseItem(row) {
  const [sku, name, qty] = row.split(',').map((part) => part.trim());
  const quantity = Number(qty);
  if (!sku || !name || !Number.isInteger(quantity) || quantity < 0) {
    throw new Error(`invalid inventory row: ${row}`);
  }
  return { sku, name, quantity };
}

export function parseInventory(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map(parseItem);
}
