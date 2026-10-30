import { isLowStock } from './lowStock.js';

export function summarize(items) {
  let units = 0;
  for (const item of items) units += item.quantity;
  return { skus: items.length, units };
}

export function reportRows(items) {
  return [...items]
    .sort((a, b) => a.sku.localeCompare(b.sku))
    .map((item) => ({ sku: item.sku, name: item.name, quantity: item.quantity, lowStock: isLowStock(item) }));
}
