import { Forbidden, NotFound, getReport, listReports } from './reports.js';
import { createShareLink, resolveShareLink } from './shares.js';

const REPORT = /^\/reports\/(\d+)$/;
const SHARE = /^\/reports\/(\d+)\/share$/;
const SHARED = /^\/s\/([0-9a-f]{32})$/;

export function handle(store, { method, path, user }) {
  const shared = SHARED.exec(path);
  if (method === 'GET' && shared) {
    const report = resolveShareLink(store, shared[1]);
    return report ? { status: 200, body: report } : { status: 404, body: { error: 'not found' } };
  }
  if (!user) return { status: 401, body: { error: 'sign in required' } };
  try {
    if (method === 'GET' && path === '/reports') {
      return { status: 200, body: listReports(store, user).map(summary) };
    }
    const match = REPORT.exec(path);
    if (method === 'GET' && match) {
      return { status: 200, body: getReport(store, user, Number(match[1])) };
    }
    const share = SHARE.exec(path);
    if (method === 'POST' && share) {
      return { status: 201, body: createShareLink(store, user, Number(share[1])) };
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
