const DAY_MS = 24 * 60 * 60 * 1000;

// Names of the archives created more than `retentionDays` days before `now`.
export function selectExpired(entries, now, config) {
  const cutoff = now.getTime() - config.retentionDays * DAY_MS;
  return entries
    .filter((entry) => entry.createdAt.getTime() < cutoff)
    .map((entry) => entry.name);
}
