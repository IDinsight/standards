import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';

import { createApp } from './app.js';

const STATIC = {
  '/': ['contacts.html', 'text/html; charset=utf-8'],
  '/static/contacts.js': ['contacts.js', 'text/javascript; charset=utf-8'],
};

const handle = createApp();

const server = createServer(async (req, res) => {
  const asset = req.method === 'GET' ? STATIC[req.url] : undefined;
  if (asset) {
    const content = await readFile(new URL('../public/' + asset[0], import.meta.url));
    res.writeHead(200, { 'content-type': asset[1] });
    res.end(content);
    return;
  }
  let body = '';
  for await (const chunk of req) body += chunk;
  const result = handle({ method: req.method, url: req.url, body });
  res.writeHead(result.status, result.headers);
  res.end(result.body);
});

server.listen(Number(process.env.PORT ?? 3000));
