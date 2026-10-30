import { createServer } from './server.js';
import { createStore } from './store.js';

const port = Number(process.env.PORT ?? 3000);

createServer(createStore()).listen(port, () => {
  console.log(`orders listening on http://localhost:${port}`);
});
