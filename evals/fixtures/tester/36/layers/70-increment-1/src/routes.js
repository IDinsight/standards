import { searchByName } from './search.js';

export function route(store, method, url) {
  const { pathname, searchParams } = new URL(url, 'http://localhost');
  if (method !== 'GET') return { status: 405, body: { error: 'method not allowed' } };
  if (pathname === '/contacts') return { status: 200, body: { results: store.list() } };
  if (pathname === '/contacts/search') return searchByName(store, searchParams.get('name'));
  const match = /^\/contacts\/(\d+)$/.exec(pathname);
  if (match) {
    const contact = store.get(Number(match[1]));
    return contact ? { status: 200, body: contact } : { status: 404, body: { error: 'not found' } };
  }
  return { status: 404, body: { error: 'not found' } };
}
