import { listItems } from './inventory.js';

export function stockSummary(inventory) {
  const items = listItems(inventory);
  let totalUnits = 0;
  for (const item of items) totalUnits += item.quantity;
  return { itemCount: items.length, totalUnits };
}
