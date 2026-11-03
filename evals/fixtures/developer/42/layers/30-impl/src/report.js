import { isLowStock } from './inventory.js';

export function stockReport(items) {
  const sorted = [...items].sort((a, b) => a.sku.localeCompare(b.sku));
  const lines = sorted.map((item) => {
    const line = `${item.sku}  ${item.name}  ${item.quantity}`;
    return isLowStock(item) ? `${line}  LOW` : line;
  });
  const low = items.filter(isLowStock).length;
  lines.push(`${items.length} items, ${low} low stock`);
  return lines.join('\n');
}
