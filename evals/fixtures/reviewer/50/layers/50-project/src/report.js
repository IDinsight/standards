import { lowStock } from './stock.js';

export function formatReport(items, threshold) {
  const rows = lowStock(items, threshold);
  if (rows.length === 0) return 'No items below reorder level.';
  return rows.map((item) => [item.sku, item.name, item.quantity].join('\t')).join('\n');
}
