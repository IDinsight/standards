import { createServer } from 'node:http';

import { route } from './router.js';
import { MemoryStore } from './store.js';

const store = new MemoryStore({ limit: Number(process.env.CONTACTS_LIMIT ?? 1000) });

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  const body = await readJson(req);
  const result = body === null
    ? { status: 400, body: { errors: ['body must be valid JSON'] } }
    : await route({ method: req.method, path: new URL(req.url, 'http://localhost').pathname, body }, { store });
  res.writeHead(result.status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(result.body));
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => {
  console.log(`contacts-api listening on ${port}`);
});
