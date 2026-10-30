import { createServer } from 'node:http';

import { createBookmarkRoutes } from './routes/bookmarks.js';
import { createStore } from './store.js';

const store = createStore(process.env.BOOKMARKS_FILE ?? 'data/bookmarks.json');
const routes = createBookmarkRoutes({ store });

async function readJson(req) {
  let text = '';
  for await (const chunk of req) text += chunk;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function dispatch(req) {
  const { pathname } = new URL(req.url, 'http://localhost');
  if (pathname === '/bookmarks' && req.method === 'GET') return routes.list();
  if (pathname === '/bookmarks' && req.method === 'POST') return routes.create(await readJson(req));
  return { status: 404, body: { error: 'not_found' } };
}

createServer(async (req, res) => {
  let result;
  try {
    result = await dispatch(req);
  } catch (error) {
    console.error('request failed', error);
    result = { status: 500, body: { error: 'internal_error' } };
  }
  res.writeHead(result.status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(result.body));
}).listen(Number(process.env.PORT ?? 3000));
