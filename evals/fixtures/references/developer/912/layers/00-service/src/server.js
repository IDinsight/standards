import http from 'node:http';

import { statusPayload } from './status.js';

function sendJson(res, statusCode, body) {
  const text = JSON.stringify(body);
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(text),
  });
  res.end(text);
}

export function createServer({ version, startedAt = Date.now() } = {}) {
  const routes = {
    '/health': () => ({ status: 'ok' }),
    '/status': () => statusPayload({ version, startedAt }),
  };

  return http.createServer((req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');
    const route = routes[pathname];
    if (!route) {
      sendJson(res, 404, { error: 'not found' });
      return;
    }
    if (req.method !== 'GET') {
      res.setHeader('allow', 'GET');
      sendJson(res, 405, { error: 'method not allowed' });
      return;
    }
    sendJson(res, 200, route());
  });
}
