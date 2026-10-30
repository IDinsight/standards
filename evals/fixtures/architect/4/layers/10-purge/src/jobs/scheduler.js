const DAY_MS = 86_400_000;

// Publishes the purge job on a fixed interval.
export function startScheduler({ bus, logger, intervalMs = 3_600_000, retentionDays = 7, now = () => new Date() }) {
  const tick = () => {
    const olderThan = new Date(now().getTime() - retentionDays * DAY_MS).toISOString();
    bus.publish('exports.purge', { olderThan });
    logger.info('purge scheduled', { olderThan });
  };
  const timer = setInterval(tick, intervalMs);
  timer.unref();
  return { tick, stop: () => clearInterval(timer) };
}
