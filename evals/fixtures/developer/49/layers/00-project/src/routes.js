const json = (status, body) => ({ status, type: 'application/json', body: JSON.stringify(body) });

export function route(catalog, method, rawUrl) {
  const url = new URL(rawUrl, 'http://localhost');
  if (!url.pathname.startsWith('/api/')) return null;
  if (method !== 'GET') return json(405, { error: 'method not allowed' });

  if (url.pathname === '/api/books') return json(200, catalog.list());

  const byId = /^\/api\/books\/([^/]+)$/.exec(url.pathname);
  if (byId) {
    const book = catalog.get(Number(byId[1]));
    return book ? json(200, book) : json(404, { error: 'book not found' });
  }

  return json(404, { error: 'not found' });
}
