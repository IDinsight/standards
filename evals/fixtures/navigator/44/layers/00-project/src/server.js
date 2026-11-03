import http from 'node:http';

import { listOrders } from './orders.js';
import { createStore } from './store.js';

const store = createStore();
const port = Number(process.env.PORT ?? 3000);

export function route(method, pathname, orders) {
  if (method === 'GET' && pathname === '/orders') {
    return { status: 200, type: 'application/json', body: JSON.stringify(listOrders(orders)) };
  }
  return { status: 404, type: 'text/plain', body: 'not found' };
}

http.createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  const result = route(req.method, pathname, store);
  res.writeHead(result.status, { 'content-type': result.type });
  res.end(result.body);
}).listen(port, () => {
  console.log(`orders listening on http://localhost:${port}`);
});
