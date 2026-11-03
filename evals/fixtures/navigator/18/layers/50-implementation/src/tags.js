// Tags are compared and stored in a single canonical form: trimmed and lowercase,
// with empty and repeated tags dropped. Order of first appearance is kept.
export function normalizeTags(tags) {
  const seen = new Set();
  const result = [];
  for (const raw of tags) {
    const tag = String(raw).trim().toLowerCase();
    if (tag && !seen.has(tag)) {
      seen.add(tag);
      result.push(tag);
    }
  }
  return result;
}
