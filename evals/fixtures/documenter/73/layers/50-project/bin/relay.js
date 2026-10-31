#!/usr/bin/env node
import { loadConfig } from '../src/config.js';
import { deliver } from '../src/deliver.js';
import { startServer } from '../src/server.js';

const config = loadConfig();

if (process.argv.includes('--print-config')) {
  process.stdout.write(`${JSON.stringify(config)}\n`);
} else {
  if (!config.targetUrl) {
    process.stderr.write('TARGET_URL is required\n');
    process.exit(1);
  }
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const send = async (delivery) => {
    const response = await fetch(config.targetUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(delivery.event),
    });
    if (!response.ok) throw new Error(`target responded ${response.status}`);
  };
  await startServer(config, (event) => {
    deliver(send, { id: event.id ?? null, event }, { sleep })
      .then((result) => console.log(`delivery ${result.status} after ${result.attempts} attempt(s)`));
  });
  console.log(`relay listening on ${config.port}`);
}
