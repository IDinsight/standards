import { createRecord, deleteRecord, getRecord, listRecords, updateRecord } from './handlers.js';

const ROUTES = [
  { method: 'GET', path: '/records', handle: (store, params, body, query) => listRecords(store, query) },
  { method: 'POST', path: '/records', handle: (store, params, body) => createRecord(store, body) },
  { method: 'GET', path: '/records/:id', handle: (store, [id]) => getRecord(store, id) },
  { method: 'PATCH', path: '/records/:id', handle: (store, [id], body) => updateRecord(store, id, body) },
  { method: 'DELETE', path: '/records/:id', handle: (store, [id]) => deleteRecord(store, id) },
];

function matchPath(pattern, path) {
  const want = pattern.split('/');
  const got = path.split('/');
  if (want.length !== got.length) return null;
  const params = [];
  for (let index = 0; index < want.length; index += 1) {
    if (want[index].startsWith(':')) params.push(got[index]);
    else if (want[index] !== got[index]) return null;
  }
  return params;
}

export function route(store, method, path, body = undefined, query = {}) {
  for (const entry of ROUTES) {
    if (entry.method !== method) continue;
    const params = matchPath(entry.path, path);
    if (params) return entry.handle(store, params, body, query);
  }
  return { status: 404, body: { error: 'no route' } };
}
