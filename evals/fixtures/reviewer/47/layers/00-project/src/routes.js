import { can } from './auth.js';
import { listRecords } from './records.js';

function json(status, body) {
  return { status, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

export function listRecordsHandler(user) {
  if (!can(user, 'records:read')) return json(403, { error: 'forbidden' });
  return json(200, listRecords());
}

export const routes = {
  'GET /records': listRecordsHandler,
};

export function dispatch(method, path, user) {
  const handler = routes[method + ' ' + path];
  return handler ? handler(user) : json(404, { error: 'not found' });
}
