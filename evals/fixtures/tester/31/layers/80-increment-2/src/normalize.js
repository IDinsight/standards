// Shared by the query, names, and emails so both sides of a comparison are folded the same way.
export function normalize(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}
