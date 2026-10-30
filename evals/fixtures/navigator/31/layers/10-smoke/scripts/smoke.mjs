// Post a sample quote to a deployed environment and record the result.
// Defaults to production; set SMOKE_BASE_URL to target another environment.
import { appendFile, mkdir } from 'node:fs/promises';

const baseUrl = process.env.SMOKE_BASE_URL ?? 'https://quotes.parcelwise-prod.net';
const started = Date.now();
let line;

try {
  const response = await fetch(`${baseUrl}/quotes`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ origin: '10001', destination: '94105', weightGrams: 1200 }),
  });
  line = `${new Date().toISOString()} ${baseUrl} status=${response.status} ms=${Date.now() - started}`;
  if (!response.ok) process.exitCode = 1;
} catch (error) {
  line = `${new Date().toISOString()} ${baseUrl} error=${error.cause?.code ?? error.message} ms=${Date.now() - started}`;
  process.exitCode = 1;
}

await mkdir(new URL('../logs/', import.meta.url), { recursive: true });
await appendFile(new URL('../logs/smoke.log', import.meta.url), `${line}\n`);
console.log(line);
