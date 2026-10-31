import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';

const DAY_MS = 24 * 60 * 60 * 1000;
const RETENTION_DAYS = 30;

export async function runCleanup({ archiveDir, now = Date.now() }) {
  const cutoff = now - RETENTION_DAYS * DAY_MS;
  const entries = await readdir(archiveDir, { withFileTypes: true });
  const summary = { scanned: 0, removed: [], kept: 0 };
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    summary.scanned += 1;
    const file = path.join(archiveDir, entry.name);
    const { mtimeMs } = await stat(file);
    if (mtimeMs < cutoff) {
      await unlink(file);
      summary.removed.push(entry.name);
    } else {
      summary.kept += 1;
    }
  }
  summary.removed.sort();
  return summary;
}

export function formatSummary(summary) {
  return `archive cleanup: scanned ${summary.scanned}, removed ${summary.removed.length}, kept ${summary.kept}`;
}
