export const DEFAULT_THRESHOLD = 5;

// A category with no entry uses the default; a configured 0 is a real threshold.
export function thresholdFor(item, thresholds = {}) {
  return thresholds[item.category] ?? DEFAULT_THRESHOLD;
}

export function lowStock(items, thresholds = {}) {
  return items.filter((item) => item.quantity <= thresholdFor(item, thresholds));
}
