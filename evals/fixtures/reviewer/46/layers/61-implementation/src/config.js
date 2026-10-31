export const DEFAULT_RETENTION_DAYS = 30;

export function loadConfig(env = process.env) {
  return { archiveDir: env.ARCHIVE_DIR || './var/archive' };
}

export function parseRetentionDays(value) {
  if (value === undefined || value === '') return DEFAULT_RETENTION_DAYS;
  const days = /^\d+$/.test(value) ? Number(value) : Number.NaN;
  if (!(days >= 1)) {
    throw new Error(`ARCHIVE_RETENTION_DAYS must be a whole number of days, 1 or more (got "${value}")`);
  }
  return days;
}

export function loadCleanupConfig(env = process.env) {
  return { ...loadConfig(env), retentionDays: parseRetentionDays(env.ARCHIVE_RETENTION_DAYS) };
}
