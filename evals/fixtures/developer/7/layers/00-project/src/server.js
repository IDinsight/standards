import { createServer } from 'node:http';

import { handle } from './app.js';
import { sampleOrders } from './sample-data.js';
import { seed } from './store.js';

seed(sampleOrders);
const port = Number(process.env.PORT ?? 3000);

createServer((req, res) => {
  const { status, headers, body } = handle(req);
  res.writeHead(status, headers);
  res.end(body);
}).listen(port, () => console.log(`order-desk listening on ${port}`));
