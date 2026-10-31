import { readFileSync } from 'node:fs';

import { parseDuration } from './duration.js';

function intervalSeconds(name, interval) {
  if (Number.isInteger(interval) && interval > 0) return interval;
  const seconds = typeof interval === 'string' ? parseDuration(interval) : null;
  if (seconds === null) throw new Error(`config: ${name}: invalid interval ${JSON.stringify(interval)}`);
  return seconds;
}

export function parseConfig(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data.jobs)) throw new Error('config: "jobs" must be an array');
  return data.jobs.map((job, index) => {
    const name = job.name ?? `job ${index + 1}`;
    if (typeof job.command !== 'string' || !job.command) {
      throw new Error(`config: ${name}: "command" is required`);
    }
    return { name, command: job.command, intervalSeconds: intervalSeconds(name, job.interval) };
  });
}

export function loadConfig(path) {
  return parseConfig(readFileSync(path, 'utf8'));
}
