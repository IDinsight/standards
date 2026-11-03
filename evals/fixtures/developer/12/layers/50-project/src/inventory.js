export function createInventory(items = []) {
  return { items: items.map((item) => ({ ...item })) };
}

export function findItem(inventory, sku) {
  const item = inventory.items.find((candidate) => candidate.sku === sku);
  if (!item) throw new Error(`unknown sku: ${sku}`);
  return item;
}

export function addItem(inventory, { sku, name, quantity = 0, reorderLevel = null }) {
  if (!sku || !name) throw new Error('sku and name are required');
  if (inventory.items.some((item) => item.sku === sku)) throw new Error(`duplicate sku: ${sku}`);
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error('quantity must be a non-negative integer');
  }
  const item = { sku, name, quantity, reorderLevel };
  inventory.items.push(item);
  return item;
}

export function adjust(inventory, sku, delta) {
  const item = findItem(inventory, sku);
  if (!Number.isInteger(delta)) throw new Error('delta must be an integer');
  if (item.quantity + delta < 0) throw new Error(`not enough stock for ${sku}`);
  item.quantity += delta;
  return item;
}

export function setReorderLevel(inventory, sku, level) {
  const item = findItem(inventory, sku);
  if (level !== null && (!Number.isInteger(level) || level < 0)) {
    throw new Error('reorder level must be a non-negative integer');
  }
  item.reorderLevel = level;
  return item;
}

export function listItems(inventory) {
  return [...inventory.items].sort((left, right) => left.name.localeCompare(right.name));
}
