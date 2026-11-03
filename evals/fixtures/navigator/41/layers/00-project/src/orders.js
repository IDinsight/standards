import { readFile } from 'node:fs/promises';

export async function loadOrders(file) {
  const orders = JSON.parse(await readFile(file, 'utf8'));
  if (!Array.isArray(orders)) throw new TypeError(`${file} must contain an array of orders`);
  return orders;
}
