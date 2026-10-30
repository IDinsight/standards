import { readFileSync } from 'node:fs';

/** Parse inventory CSV text into item objects. */
export function parseInventory(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [sku, name, qty, reorderAt] = line.split(',').map((part) => part.trim());
      return { sku, name, qty: Number(qty), reorderAt: Number(reorderAt) };
    });
}

/** Read and parse an inventory CSV file. */
export function loadInventory(path) {
  return parseInventory(readFileSync(path, 'utf8'));
}
