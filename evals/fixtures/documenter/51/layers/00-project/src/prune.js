import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';

const DAY_MS = 24 * 60 * 60 * 1000;

export function selectExpired(entries, { now, maxAgeDays, pattern = /\.log(\.\d+)?$/ }) {
  const cutoff = now - maxAgeDays * DAY_MS;
  return entries
    .filter((entry) => pattern.test(entry.name) && entry.mtimeMs < cutoff)
    .map((entry) => entry.name)
    .sort();
}

export async function listEntries(dir) {
  const names = await readdir(dir);
  const entries = [];
  for (const name of names) {
    const info = await stat(path.join(dir, name));
    if (info.isFile()) entries.push({ name, mtimeMs: info.mtimeMs });
  }
  return entries;
}

export async function prune(dir, { now = Date.now(), maxAgeDays } = {}) {
  const expired = selectExpired(await listEntries(dir), { now, maxAgeDays });
  for (const name of expired) await unlink(path.join(dir, name));
  return expired;
}
