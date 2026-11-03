import { readFileSync } from 'node:fs';

export function parseConfig(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data.jobs)) throw new Error('config: "jobs" must be an array');
  return data.jobs.map((job, index) => {
    const name = job.name ?? `job ${index + 1}`;
    if (typeof job.command !== 'string' || !job.command) {
      throw new Error(`config: ${name}: "command" is required`);
    }
    if (!Number.isInteger(job.interval) || job.interval <= 0) {
      throw new Error(`config: ${name}: invalid interval ${JSON.stringify(job.interval)}`);
    }
    return { name, command: job.command, intervalSeconds: job.interval };
  });
}

export function loadConfig(path) {
  return parseConfig(readFileSync(path, 'utf8'));
}
