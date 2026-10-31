import { readFile } from 'node:fs/promises';

export async function loadVisits(path) {
  const visits = JSON.parse(await readFile(path, 'utf8'));
  return visits.sort((a, b) => a.date.localeCompare(b.date));
}
