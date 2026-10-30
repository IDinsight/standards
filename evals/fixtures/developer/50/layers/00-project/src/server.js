import http from 'node:http';
import { pathToFileURL } from 'node:url';

import { createApp } from './app.js';
import { createUserStore } from './users.js';

export function createServer(app = createApp({ users: createUserStore() })) {
  return http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      let body;
      try {
        body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : undefined;
      } catch {
        res.writeHead(400, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: 'invalid JSON' }));
        return;
      }
      const url = new URL(req.url, 'http://localhost');
      const response = app({ method: req.method, path: url.pathname, headers: req.headers, body });
      res.writeHead(response.status, response.headers);
      res.end(response.body);
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 3000);
  createServer().listen(port, () => console.log(`accounts-api listening on ${port}`));
}
