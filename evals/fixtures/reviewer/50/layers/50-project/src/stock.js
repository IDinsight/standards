export const DEFAULT_THRESHOLD = 5;

export function lowStock(items, threshold = DEFAULT_THRESHOLD) {
  return items.filter((item) => item.quantity <= threshold);
}
