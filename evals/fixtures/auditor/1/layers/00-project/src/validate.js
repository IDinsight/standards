export const CATEGORIES = ['travel', 'meals', 'lodging', 'supplies', 'other'];

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isDate(value) {
  if (typeof value !== 'string' || !DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function validateExpense(input) {
  const errors = [];
  const body = input && typeof input === 'object' ? input : {};
  if (!isDate(body.date)) errors.push('date must be YYYY-MM-DD');
  if (!Number.isInteger(body.amountCents) || body.amountCents <= 0) {
    errors.push('amountCents must be a positive integer');
  }
  if (!CATEGORIES.includes(body.category)) errors.push(`category must be one of ${CATEGORIES.join(', ')}`);
  const merchant = typeof body.merchant === 'string' ? body.merchant.trim() : '';
  if (!merchant) errors.push('merchant is required');
  const description = body.description === undefined ? '' : body.description;
  if (typeof description !== 'string' || description.length > 200) {
    errors.push('description must be a string of at most 200 characters');
  }
  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      date: body.date,
      merchant,
      category: body.category,
      description: description.trim(),
      amountCents: body.amountCents,
    },
  };
}
