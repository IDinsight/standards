import { createServer } from 'node:http';

import { handle } from './router.js';

const port = Number(process.env.PORT ?? 3000);

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return undefined;
  }
}

createServer(async (request, response) => {
  const body = await readJson(request);
  const result = body === undefined
    ? { status: 400, body: { error: 'request body must be JSON' } }
    : handle(request.method, request.url, body);
  response.writeHead(result.status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(result.body));
}).listen(port, () => console.log(`reports-service listening on ${port}`));
