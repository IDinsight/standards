import { readRecord } from './records.js';

export function summarize(dir, ids, { lowStockAt = 5 } = {}) {
  const items = ids.map((id) => readRecord(id, dir));
  const total = items.reduce((sum, item) => sum + item.quantity, 0);
  const low = items.filter((item) => item.quantity <= lowStockAt).map((item) => item.sku);
  return { count: items.length, total, low };
}
