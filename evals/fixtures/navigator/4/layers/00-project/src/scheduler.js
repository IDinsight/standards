export function parseDueAt(value) {
  const time = typeof value === 'number' ? value : Date.parse(value);
  if (!Number.isFinite(time)) throw new Error('invalid dueAt: ' + value);
  return time;
}

export function createScheduler({ store, mailer, maxBatch, now = Date.now }) {
  let timer = null;

  async function tick() {
    const due = store.due(now(), maxBatch);
    for (const reminder of due) {
      await mailer.send(reminder);
      store.markSent(reminder.id, now());
    }
    return due.length;
  }

  return {
    tick,
    start(intervalMs) {
      if (timer) return;
      timer = setInterval(() => {
        tick().catch((error) => console.error(error));
      }, intervalMs);
    },
    stop() {
      clearInterval(timer);
      timer = null;
    },
  };
}
