export const DEFAULT_THRESHOLD = 5;

export function lowStock(items, thresholds = {}) {
  return items
    .filter((item) => item.quantity <= (thresholds[item.category] || DEFAULT_THRESHOLD))
    .sort((a, b) => a.quantity - b.quantity);
}
