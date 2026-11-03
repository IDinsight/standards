export function normalizeTag(tag) {
  return String(tag).trim().toLowerCase();
}

export function union(a, b) {
  const result = new Set(a);
  for (const value of b) result.add(value);
  return result;
}

export function intersection(a, b) {
  const result = new Set();
  for (const value of a) {
    if (b.has(value)) result.add(value);
  }
  return result;
}

export function difference(a, b) {
  const result = new Set();
  for (const value of a) {
    if (!b.has(value)) result.add(value);
  }
  return result;
}
