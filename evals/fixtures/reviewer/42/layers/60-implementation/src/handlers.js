import { listRecords } from './records.js';
import { searchRecords } from './search.js';

export function handle(method, url, store) {
  if (method !== 'GET') return { status: 405, body: { error: 'method not allowed' } };
  const { pathname, searchParams } = new URL(url, 'http://localhost');
  if (pathname === '/records') return { status: 200, body: listRecords(store, searchParams) };
  if (pathname === '/records/search') return searchRecords(store, searchParams);
  return { status: 404, body: { error: 'not found' } };
}
