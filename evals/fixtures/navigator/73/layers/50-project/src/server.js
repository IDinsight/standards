import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';

import { resolve } from './resolve.js';
import { createStore } from './store.js';

const links = JSON.parse(readFileSync(new URL('../links.json', import.meta.url), 'utf8'));
const store = createStore(links);

export const server = createServer((req, res) => {
  const code = decodeURIComponent(req.url.slice(1));
  const result = resolve(store, code);
  res.writeHead(result.status, result.location ? { Location: result.location } : {});
  res.end();
});

if (process.argv[1] === new URL(import.meta.url).pathname) {
  server.listen(Number(process.env.PORT ?? 8080));
}
