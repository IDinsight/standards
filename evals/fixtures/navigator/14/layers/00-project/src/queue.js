// In-memory job queue. Jobs pushed with a delay become ready once the clock
// passes their run time; jobs that cannot be processed are kept in `dead`.
export class MemoryQueue {
  constructor() {
    this.ready = [];
    this.delayed = [];
    this.dead = [];
  }

  push(job, { delayMs = 0, now = Date.now() } = {}) {
    if (delayMs > 0) this.delayed.push({ job, runAt: now + delayMs });
    else this.ready.push(job);
  }

  take(now = Date.now()) {
    const due = this.delayed.filter((entry) => entry.runAt <= now);
    this.delayed = this.delayed.filter((entry) => entry.runAt > now);
    for (const entry of due) this.ready.push(entry.job);
    return this.ready.shift() ?? null;
  }

  bury(job, error) {
    this.dead.push({ job, error: String(error?.message ?? error) });
  }

  get size() {
    return this.ready.length + this.delayed.length;
  }
}
