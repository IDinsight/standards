import { listRecords } from './records.js';

export function handle(method, url, store) {
  if (method !== 'GET') return { status: 405, body: { error: 'method not allowed' } };
  const { pathname, searchParams } = new URL(url, 'http://localhost');
  if (pathname === '/records') return { status: 200, body: listRecords(store, searchParams) };
  return { status: 404, body: { error: 'not found' } };
}
