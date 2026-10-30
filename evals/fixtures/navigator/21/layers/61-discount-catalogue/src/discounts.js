const CODES = {
  SPRING10: { kind: 'percent', amount: 10, expires: '2026-06-30' },
  WELCOME5: { kind: 'fixed', amount: 500, expires: null },
  STAFF20: { kind: 'percent', amount: 20, expires: null },
};

export function findDiscount(code, today = new Date()) {
  if (!code) return null;
  const entry = CODES[code.trim().toUpperCase()];
  if (!entry) return null;
  if (entry.expires && today.toISOString().slice(0, 10) > entry.expires) return null;
  return entry;
}

export function discountAmount(entry, subtotal) {
  if (!entry) return 0;
  if (entry.kind === 'percent') return Math.round((subtotal * entry.amount) / 100);
  return entry.amount;
}
