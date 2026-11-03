import { readFile } from 'node:fs/promises';

export async function loadInventory(file) {
  const data = JSON.parse(await readFile(file, 'utf8'));
  if (!Array.isArray(data.items)) throw new Error(`${file}: expected an "items" array`);
  return data.items.map(normalizeItem);
}

export function normalizeItem(raw) {
  const sku = String(raw.sku ?? '').trim();
  if (!sku) throw new Error('item is missing a sku');
  const quantity = Number(raw.quantity ?? 0);
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error(`${sku}: quantity must be a non-negative integer`);
  }
  return { sku, name: String(raw.name ?? sku).trim(), quantity };
}

export function formatTable(items) {
  const width = Math.max(3, ...items.map((item) => item.sku.length));
  return items
    .map((item) => `${item.sku.padEnd(width)}  ${String(item.quantity).padStart(5)}  ${item.name}`)
    .join('\n');
}
