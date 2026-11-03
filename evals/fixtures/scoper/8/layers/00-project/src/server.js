import { createServer } from 'node:http';

import { handle } from './routes.js';

export function startServer(store, port = 8080) {
  const server = createServer((req, res) => {
    const user = userFromCookie(store, req.headers.cookie);
    const path = new URL(req.url, 'http://localhost').pathname;
    const { status, body } = handle(store, { method: req.method, path, user });
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
  });
  server.listen(port);
  return server;
}

function userFromCookie(store, cookie = '') {
  const match = /(?:^|;\s*)sid=([^;]+)/.exec(cookie);
  const userId = match ? store.sessions.get(match[1]) : undefined;
  return userId === undefined ? null : store.users.get(userId) ?? null;
}
