import http from 'node:http';

import { listOrders } from './orders.js';

export function route(method, pathname, store) {
  if (method === 'GET' && pathname === '/orders') {
    return { status: 200, type: 'application/json', body: JSON.stringify(listOrders(store)) };
  }
  return { status: 404, type: 'text/plain', body: 'not found' };
}

export function createServer(store) {
  return http.createServer((req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');
    const result = route(req.method, pathname, store);
    res.writeHead(result.status, { 'content-type': result.type });
    res.end(result.body);
  });
}
