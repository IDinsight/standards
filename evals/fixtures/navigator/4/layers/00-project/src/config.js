export const DEFAULT_FROM = 'reminders@example.org';

export function loadConfig(env = {}) {
  const intervalMs = Number(env.REMINDR_INTERVAL_MS ?? 60000);
  const maxBatch = Number(env.REMINDR_MAX_BATCH ?? 50);
  if (!Number.isInteger(intervalMs) || intervalMs <= 0) {
    throw new Error('REMINDR_INTERVAL_MS must be a positive integer');
  }
  if (!Number.isInteger(maxBatch) || maxBatch <= 0) {
    throw new Error('REMINDR_MAX_BATCH must be a positive integer');
  }
  return { from: env.REMINDR_FROM || DEFAULT_FROM, intervalMs, maxBatch };
}
