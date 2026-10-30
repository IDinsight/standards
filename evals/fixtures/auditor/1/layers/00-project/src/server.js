import { readFileSync } from 'node:fs';
import http from 'node:http';

import { parseKeys } from './auth.js';
import { createHandler } from './router.js';
import { ExpenseStore } from './store.js';

const sample = new URL('../data/sample.json', import.meta.url);
const store = process.env.DATA_FILE
  ? new ExpenseStore({ file: process.env.DATA_FILE })
  : new ExpenseStore({ records: JSON.parse(readFileSync(sample, 'utf8')) });
const handle = createHandler({ store, keys: parseKeys(process.env.API_KEYS) });

function readBody(req) {
  return new Promise((resolve, reject) => {
    let text = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => { text += chunk; });
    req.on('end', () => resolve(text));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let body = null;
  if (req.method === 'POST') {
    const text = await readBody(req);
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }
  }
  const result = handle({
    method: req.method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
    headers: req.headers,
    body,
  });
  res.writeHead(result.status, result.headers);
  res.end(result.body);
});

server.listen(Number(process.env.PORT ?? 3000), () => {
  console.log(`expense-tracker listening on ${server.address().port}`);
});
