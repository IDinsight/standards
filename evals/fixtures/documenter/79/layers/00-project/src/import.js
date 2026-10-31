import { parseCsv } from './csv.js';

const REQUIRED = ['sku', 'name', 'quantity'];

// Merge CSV rows into the item list. Existing SKUs are kept unless `replace`
// is set; rows without a SKU or with a negative or non-numeric quantity are
// skipped.
export function importItems(existing, csvText, { replace = false, now = new Date() } = {}) {
  const [header = [], ...records] = parseCsv(csvText);
  for (const column of REQUIRED) {
    if (!header.includes(column)) throw new Error(`missing column: ${column}`);
  }
  const bySku = new Map(existing.map((item) => [item.sku, item]));
  let added = 0;
  let updated = 0;
  let skipped = 0;
  for (const record of records) {
    const row = Object.fromEntries(header.map((name, index) => [name, record[index] ?? '']));
    const quantity = Number.parseInt(row.quantity, 10);
    if (!row.sku || Number.isNaN(quantity) || quantity < 0) {
      skipped += 1;
      continue;
    }
    const current = bySku.get(row.sku);
    if (current && !replace) {
      skipped += 1;
      continue;
    }
    bySku.set(row.sku, { sku: row.sku, name: row.name, quantity, updatedAt: now.toISOString() });
    if (current) updated += 1;
    else added += 1;
  }
  return { items: [...bySku.values()], added, updated, skipped };
}
