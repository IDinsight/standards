// Admin record model. Updates go through updateRecord so field rules stay in
// one place.

export const EDITABLE = ['title', 'owner', 'status', 'reviewedAt'];
const NULLABLE = new Set(['reviewedAt']);
const STATUSES = new Set(['open', 'in_review', 'closed']);

export function createRecord({ id, title, owner, status = 'open' }) {
  return { id, title: title.trim(), owner: owner.trim(), status, reviewedAt: null };
}

export function updateRecord(record, changes) {
  const next = { ...record };
  for (const [key, value] of Object.entries(changes)) {
    if (!EDITABLE.includes(key)) throw new Error(`Unknown field: ${key}`);
    if (value === null) {
      if (!NULLABLE.has(key)) throw new Error(`${key} cannot be empty`);
      next[key] = null;
      continue;
    }
    if (typeof value !== 'string') throw new Error(`${key} must be a string`);
    if (key === 'status' && !STATUSES.has(value)) throw new Error(`Invalid status: ${value}`);
    next[key] = value.trim();
  }
  return next;
}
