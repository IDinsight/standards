import { ownerScope } from '../auth.js';
import { formatCents } from '../format.js';
import { badRequest, json, notFound } from '../http.js';
import { CATEGORIES, isDate, validateExpense } from '../validate.js';

export function present(record) {
  return { ...record, amount: formatCents(record.amountCents) };
}

export function readFilters(query) {
  const errors = [];
  const filters = { from: query.from ?? null, to: query.to ?? null, category: query.category ?? null };
  if (filters.from !== null && !isDate(filters.from)) errors.push('from must be YYYY-MM-DD');
  if (filters.to !== null && !isDate(filters.to)) errors.push('to must be YYYY-MM-DD');
  if (filters.category !== null && !CATEGORIES.includes(filters.category)) errors.push('unknown category');
  return { filters, errors };
}

export function listExpenses(store, user, query) {
  const { filters, errors } = readFilters(query);
  if (errors.length) return badRequest(errors);
  const records = store.list({ ...filters, ownerId: ownerScope(user, query.owner) });
  return json(200, { expenses: records.map(present) });
}

export function getExpense(store, user, id) {
  const record = store.get(id);
  if (!record || (user.role !== 'admin' && record.ownerId !== user.userId)) return notFound();
  return json(200, present(record));
}

export function createExpense(store, user, body) {
  const result = validateExpense(body);
  if (!result.ok) return badRequest(result.errors);
  return json(201, present(store.add(user.userId, result.value)));
}
