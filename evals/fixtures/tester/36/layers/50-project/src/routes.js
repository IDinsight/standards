export function route(store, method, url) {
  const { pathname } = new URL(url, 'http://localhost');
  if (method !== 'GET') return { status: 405, body: { error: 'method not allowed' } };
  if (pathname === '/contacts') return { status: 200, body: { results: store.list() } };
  return { status: 404, body: { error: 'not found' } };
}
