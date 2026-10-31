import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';

import { DEFAULT_RETENTION_DAYS } from './config.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export function isExpired(mtimeMs, now, retentionDays) {
  return mtimeMs < now - retentionDays * DAY_MS;
}

export async function runCleanup({
  archiveDir,
  retentionDays = DEFAULT_RETENTION_DAYS,
  now = Date.now(),
  dryRun = false,
}) {
  const entries = await readdir(archiveDir, { withFileTypes: true });
  const summary = { scanned: 0, removed: [], kept: 0, dryRun };
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    summary.scanned += 1;
    const file = path.join(archiveDir, entry.name);
    const { mtimeMs } = await stat(file);
    if (isExpired(mtimeMs, now, retentionDays)) {
      if (!dryRun) await unlink(file);
      summary.removed.push(entry.name);
    } else {
      summary.kept += 1;
    }
  }
  summary.removed.sort();
  return summary;
}

export function formatSummary(summary) {
  const action = summary.dryRun ? 'would remove' : 'removed';
  return `archive cleanup: scanned ${summary.scanned}, ${action} ${summary.removed.length}, kept ${summary.kept}`;
}
