import { readFileSync } from 'node:fs';
import http from 'node:http';

import { handle } from './handlers.js';
import { createStore } from './store.js';

const seed = JSON.parse(readFileSync(new URL('../data/records.json', import.meta.url), 'utf8'));
const store = createStore(seed);
const port = Number(process.env.PORT ?? 3000);

http
  .createServer((req, res) => {
    const { status, body } = handle(req.method, req.url, store);
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
  })
  .listen(port, () => console.log('records-api listening on ' + port));
