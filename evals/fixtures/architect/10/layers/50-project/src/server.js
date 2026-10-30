import { createServer } from 'node:http';

import { searchUsers } from './search.js';

export function handleSearch(users, url) {
  const query = url.searchParams.get('q') ?? '';
  const results = searchUsers(users, query);
  return { status: 200, body: { results } };
}

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

export function createApp(users) {
  return createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/users/search') {
      const { status, body } = handleSearch(users, url);
      send(res, status, body);
      return;
    }
    send(res, 404, { error: 'not found' });
  });
}
