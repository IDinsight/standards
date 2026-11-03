import { authenticate } from './auth.js';
import { json, notFound } from './http.js';
import { createExpense, getExpense, listExpenses } from './routes/expenses.js';
import { monthlyReport } from './routes/reports.js';

// req: { method, path, query, headers, body }; returns { status, headers, body }.
export function createHandler({ store, keys }) {
  return function handle(req) {
    const user = authenticate(req.headers ?? {}, keys);
    if (!user) return json(401, { error: 'unauthorized' });
    const query = req.query ?? {};
    if (req.path === '/expenses') {
      if (req.method === 'GET') return listExpenses(store, user, query);
      if (req.method === 'POST') return createExpense(store, user, req.body);
      return json(405, { error: 'method not allowed' });
    }
    const match = /^\/expenses\/(\d+)$/.exec(req.path);
    if (match) {
      if (req.method === 'GET') return getExpense(store, user, Number(match[1]));
      return json(405, { error: 'method not allowed' });
    }
    if (req.path === '/reports/monthly') {
      if (req.method === 'GET') return monthlyReport(store, user, query);
      return json(405, { error: 'method not allowed' });
    }
    return notFound();
  };
}
