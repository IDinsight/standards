export function createInventory() {
  return new Map();
}

export function addItem(inventory, { sku, name, quantity = 0, reorderLevel = null }) {
  if (!sku) throw new Error('sku is required');
  if (inventory.has(sku)) throw new Error(`duplicate sku: ${sku}`);
  const item = { sku, name, quantity, reorderLevel };
  inventory.set(sku, item);
  return item;
}

export function adjustQuantity(inventory, sku, delta) {
  const item = inventory.get(sku);
  if (!item) throw new Error(`unknown sku: ${sku}`);
  const next = item.quantity + delta;
  if (next < 0) throw new Error(`quantity for ${sku} cannot go below zero`);
  item.quantity = next;
  return item;
}

export function listItems(inventory) {
  return [...inventory.values()].sort((a, b) => a.sku.localeCompare(b.sku));
}
