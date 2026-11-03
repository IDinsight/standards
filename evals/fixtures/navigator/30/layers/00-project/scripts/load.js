// Send a burst of quote requests to a running instance and summarize the
// response statuses.
//   node scripts/load.js [--url http://localhost:8080] [--requests 40] [--concurrency 8]
import { mkdirSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    url: { type: 'string', default: 'http://localhost:8080' },
    requests: { type: 'string', default: '40' },
    concurrency: { type: 'string', default: '8' },
  },
});

const total = Number(values.requests);
const concurrency = Number(values.concurrency);
const counts = {};
let sent = 0;

async function worker() {
  while (sent < total) {
    sent += 1;
    let key;
    try {
      const response = await fetch(`${values.url}/quote?sku=SKU-${sent % 7}&region=eu&qty=2`);
      key = String(response.status);
      await response.arrayBuffer();
    } catch (error) {
      key = error.cause?.code ?? error.name;
    }
    counts[key] = (counts[key] ?? 0) + 1;
  }
}

const started = new Date();
await Promise.all(Array.from({ length: concurrency }, worker));

const lines = [`run ${started.toISOString()} ${values.url}`,
  ...Object.entries(counts).map(([status, count]) => `${status} ${count}`)];
mkdirSync(new URL('../var/load/', import.meta.url), { recursive: true });
writeFileSync(new URL('../var/load/last-run.txt', import.meta.url), `${lines.join('\n')}\n`);
console.log(lines.join('\n'));
