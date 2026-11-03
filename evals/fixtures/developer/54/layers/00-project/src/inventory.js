// Normalize raw item records (from the warehouse export) into item objects.
export function loadItems(records) {
  return records.map((record) => ({
    sku: String(record.sku).trim(),
    name: String(record.name).trim(),
    quantity: Number(record.quantity),
    reorderLevel: record.reorderLevel === undefined ? 0 : Number(record.reorderLevel),
  }));
}

// Return a new item list with `delta` applied to the item with the given SKU.
export function adjustQuantity(items, sku, delta) {
  return items.map((item) => (item.sku === sku ? { ...item, quantity: item.quantity + delta } : item));
}

export function totalUnits(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
