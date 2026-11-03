import { createReport, getReport, listReports } from './api.js';

const methodNotAllowed = () => ({ status: 405, body: { error: 'method not allowed' } });

export function route(store, { method, path, user = null, body = null }) {
  if (path === '/reports') {
    if (method === 'GET') return listReports(store, user);
    if (method === 'POST') return createReport(store, user, body);
    return methodNotAllowed();
  }
  const match = /^\/reports\/([^/]+)$/.exec(path);
  if (match) {
    if (method === 'GET') return getReport(store, user, match[1]);
    return methodNotAllowed();
  }
  return { status: 404, body: { error: 'not found' } };
}
