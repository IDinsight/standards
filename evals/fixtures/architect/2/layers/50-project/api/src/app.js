import { authenticate, clearedSessionCookie, csrfOk, hasRole, sessionCookie } from './auth.js';

const ALL = ['member', 'admin', 'service'];

function json(status, body, headers = {}) {
  return { status, headers: { 'content-type': 'application/json', ...headers }, body };
}

export function createApp({ config, users, sessions, limiter, audit, expenses = [], reports = [] }) {
  function login(request) {
    const { username, password } = request.body ?? {};
    if (typeof username !== 'string' || typeof password !== 'string') {
      return json(400, { error: 'username and password are required' });
    }
    if (limiter.blocked(username)) return json(429, { error: 'too many attempts' });
    const user = users.verify(username, password);
    if (!user) {
      limiter.recordFailure(username);
      audit.record('login.failed', null, { username });
      return json(401, { error: 'invalid credentials' });
    }
    limiter.reset(username);
    const session = sessions.create(user);
    audit.record('login', user.id);
    return json(200, { user, csrfToken: session.csrfToken }, { 'set-cookie': sessionCookie(session.id, config) });
  }

  function logout(session) {
    sessions.destroy(session.id);
    audit.record('logout', session.userId);
    return json(204, undefined, { 'set-cookie': clearedSessionCookie(config) });
  }

  function me(session) {
    return json(200, { id: session.userId, role: session.role, csrfToken: session.csrfToken });
  }

  function listExpenses(session) {
    const visible = session.role === 'member'
      ? expenses.filter((expense) => expense.userId === session.userId)
      : expenses;
    return json(200, visible);
  }

  function addExpense(session, request) {
    const { amountCents, category, date, note = '' } = request.body ?? {};
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      return json(400, { error: 'amountCents must be a positive integer' });
    }
    if (typeof category !== 'string' || !category.trim()) return json(400, { error: 'category is required' });
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return json(400, { error: 'date must be YYYY-MM-DD' });
    }
    const expense = { id: expenses.length + 1, userId: session.userId, amountCents, category: category.trim(), date, note };
    expenses.push(expense);
    audit.record('expense.created', session.userId, { expenseId: expense.id });
    return json(201, expense);
  }

  function listReports() {
    return json(200, reports);
  }

  function addReport(session, request) {
    const { period, count, totals } = request.body ?? {};
    if (typeof period !== 'string' || !/^\d{4}-\d{2}$/.test(period)) return json(400, { error: 'period must be YYYY-MM' });
    if (!Number.isInteger(count) || count < 0) return json(400, { error: 'count must be a non-negative integer' });
    if (!totals || typeof totals !== 'object' || Array.isArray(totals)) return json(400, { error: 'totals must be an object' });
    const report = { id: reports.length + 1, period, count, totals, createdBy: session.userId };
    reports.push(report);
    audit.record('report.created', session.userId, { reportId: report.id, period });
    return json(201, report);
  }

  const routes = {
    'POST /logout': { roles: ALL, run: logout },
    'GET /me': { roles: ALL, run: me },
    'GET /expenses': { roles: ALL, run: listExpenses },
    'POST /expenses': { roles: ['member', 'admin'], run: addExpense },
    'GET /reports': { roles: ['admin'], run: listReports },
    'POST /reports': { roles: ['admin', 'service'], run: addReport },
  };

  return async function handle(request) {
    if (request.method === 'POST' && request.path === '/login') return login(request);
    const route = routes[`${request.method} ${request.path}`];
    if (!route) return json(404, { error: 'not found' });
    const session = authenticate(request, { sessions, config });
    if (!session) return json(401, { error: 'not signed in' });
    if (!csrfOk(request, session)) return json(403, { error: 'missing or invalid CSRF token' });
    if (!hasRole(session, route.roles)) return json(403, { error: 'forbidden' });
    return route.run(session, request);
  };
}
