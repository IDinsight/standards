import { readFile } from 'node:fs/promises';

export async function loadItems(path) {
  const data = JSON.parse(await readFile(path, 'utf8'));
  if (!Array.isArray(data.items)) throw new Error(`${path}: expected an "items" array`);
  return data.items.map((item) => ({
    sku: String(item.sku),
    name: String(item.name),
    quantity: Number(item.quantity ?? 0),
    location: item.location ?? '',
  }));
}
