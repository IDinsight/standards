#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';

import { runJobs } from '../src/runner.js';

function commandJob(id, command) {
  return {
    id,
    run: (signal) => new Promise((resolve, reject) => {
      const child = spawn(command, { shell: true, stdio: 'inherit', signal });
      child.on('error', reject);
      child.on('exit', (code, sig) => (code === 0 ? resolve(code) : reject(new Error(`${id} exited with ${sig ?? code}`))));
    }),
  };
}

const [file] = process.argv.slice(2);
if (!file) {
  console.error('usage: batchrun <jobs.json>');
  process.exit(2);
}

const spec = JSON.parse(await readFile(file, 'utf8'));
const controller = new AbortController();
let interrupts = 0;
process.on('SIGINT', () => {
  interrupts += 1;
  if (interrupts > 1) process.exit(130);
  console.error('cancelling; press Ctrl-C again to exit immediately');
  controller.abort();
});

const results = await runJobs(spec.jobs.map((job) => commandJob(job.id, job.command)), {
  signal: controller.signal,
  concurrency: spec.concurrency ?? 2,
  timeoutMs: spec.timeoutMs,
  retries: spec.retries ?? 0,
  drainMs: spec.drainMs ?? 1000,
});
for (const result of results) {
  console.log(`${result.id}\t${result.status}${result.abandoned ? ' (abandoned)' : ''}\t${result.attempts}`);
}
process.exitCode = results.every((result) => result.status === 'done') ? 0 : 1;
