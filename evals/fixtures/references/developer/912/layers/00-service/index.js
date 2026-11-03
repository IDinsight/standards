import { readFile } from 'node:fs/promises';

import { createServer } from './src/server.js';

const pkg = JSON.parse(await readFile(new URL('./package.json', import.meta.url), 'utf8'));
const port = Number(process.env.PORT ?? 8080);

createServer({ version: pkg.version }).listen(port, () => {
  console.log(`status-service ${pkg.version} listening on ${port}`);
});
