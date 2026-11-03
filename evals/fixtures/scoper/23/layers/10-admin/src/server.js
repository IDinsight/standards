import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';

import { renderAdminPage } from './admin.js';

const data = JSON.parse(await readFile(new URL('../data/sample-results.json', import.meta.url), 'utf8'));

createServer((req, res) => {
  if (req.url === '/admin') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(renderAdminPage(data.survey, data.responses));
    return;
  }
  res.writeHead(404).end('not found');
}).listen(Number(process.env.PORT ?? 3000));
