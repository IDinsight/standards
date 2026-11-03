export function parseDiscounts(text) {
  const entries = JSON.parse(text);
  if (!Array.isArray(entries)) {
    throw new Error('discount table must be a JSON array');
  }
  const table = [];
  for (const entry of entries) {
    table.push(normalizeEntry(entry));
  }
  return table;
}

function normalizeEntry(entry) {
  const { code, percent, expires } = entry;
  if (typeof code !== 'string' || code.trim() === '') {
    throw new Error('discount entry needs a code');
  }
  if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
    throw new Error(`discount ${code} needs a whole percent from 1 to 100`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expires ?? '')) {
    throw new Error(`discount ${code} needs an expires date as YYYY-MM-DD`);
  }
  return { code: code.trim().toUpperCase(), percent, expires };
}

export function findDiscount(table, code) {
  const wanted = code.trim().toUpperCase();
  for (const entry of table) {
    if (entry.code === wanted) return entry;
  }
  return null;
}
