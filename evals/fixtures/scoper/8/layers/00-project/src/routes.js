import { Forbidden, NotFound, getReport, listReports } from './reports.js';

const REPORT = /^\/reports\/(\d+)$/;

export function handle(store, { method, path, user }) {
  if (!user) return { status: 401, body: { error: 'sign in required' } };
  try {
    if (method === 'GET' && path === '/reports') {
      return { status: 200, body: listReports(store, user).map(summary) };
    }
    const match = REPORT.exec(path);
    if (method === 'GET' && match) {
      return { status: 200, body: getReport(store, user, Number(match[1])) };
    }
    return { status: 404, body: { error: 'not found' } };
  } catch (error) {
    if (error instanceof NotFound) return { status: 404, body: { error: 'not found' } };
    if (error instanceof Forbidden) return { status: 403, body: { error: 'forbidden' } };
    throw error;
  }
}

function summary(report) {
  return { id: report.id, title: report.title, teamId: report.teamId };
}
