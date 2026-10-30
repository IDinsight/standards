import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname } from 'node:path';

import { loadCatalog } from './catalog.js';
import { route } from './routes.js';

const PUBLIC_DIR = new URL('../public/', import.meta.url);
const STATIC_FILES = new Set(['index.html', 'app.js', 'style.css']);
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

export function createApp(catalog = loadCatalog()) {
  return createServer(async (req, res) => {
    const result = route(catalog, req.method, req.url);
    if (result) {
      res.writeHead(result.status, { 'content-type': result.type });
      res.end(result.body);
      return;
    }
    const { pathname } = new URL(req.url, 'http://localhost');
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!STATIC_FILES.has(file)) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('not found');
      return;
    }
    const body = await readFile(new URL(file, PUBLIC_DIR));
    res.writeHead(200, { 'content-type': CONTENT_TYPES[extname(file)] });
    res.end(body);
  });
}
