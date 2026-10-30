import { createServer } from 'node:http';

import { createStore } from './contacts.js';
import { route } from './routes.js';

const store = createStore([
  { name: 'Ana Lima', email: 'ana@example.org' },
  { name: 'Joan Park', email: 'joan@example.org' },
]);

const port = Number(process.env.PORT ?? 3000);

createServer((req, res) => {
  const { status, body } = route(store, req.method, req.url);
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}).listen(port, () => {
  console.log('contacts-service listening on ' + port);
});
