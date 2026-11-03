import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export async function appendDeadLetter(file, entry) {
  await mkdir(path.dirname(file), { recursive: true });
  const line = JSON.stringify({ ...entry, failedAt: new Date().toISOString() });
  await appendFile(file, `${line}\n`);
}
