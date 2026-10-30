import { ownerScope } from '../auth.js';
import { formatCents } from '../format.js';
import { badRequest, json } from '../http.js';
import { CATEGORIES } from '../validate.js';

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export function monthlyReport(store, user, query) {
  if (!MONTH.test(query.month ?? '')) return badRequest(['month must be YYYY-MM']);
  const records = store.list({
    ownerId: ownerScope(user, query.owner),
    from: `${query.month}-01`,
    to: `${query.month}-31`,
  });
  const totals = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));
  for (const record of records) totals[record.category] += record.amountCents;
  const totalCents = records.reduce((sum, record) => sum + record.amountCents, 0);
  return json(200, {
    month: query.month,
    count: records.length,
    totalCents,
    total: formatCents(totalCents),
    byCategory: CATEGORIES.map((category) => ({
      category,
      totalCents: totals[category],
      total: formatCents(totals[category]),
    })),
  });
}
