import { readFileSync } from 'node:fs';

export function loadItems(file) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(data.items)) throw new Error(`${file}: expected an "items" array`);
  return data.items.map((item) => ({
    sku: String(item.sku),
    name: String(item.name),
    quantity: Number(item.quantity),
  }));
}

export function lowStock(items, threshold) {
  return items.filter((item) => item.quantity < threshold);
}
