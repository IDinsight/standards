// Takes jobs from a queue and runs the handler registered for each job type.
// A failed job is pushed back with an exponential delay until it has used
// maxAttempts; after that, or when no handler exists, it is buried.
export class Worker {
  constructor({ queue, handlers, maxAttempts = 3, baseDelayMs = 1000, pollIntervalMs = 500, clock = Date.now, log = console }) {
    this.queue = queue;
    this.handlers = handlers;
    this.maxAttempts = maxAttempts;
    this.baseDelayMs = baseDelayMs;
    this.pollIntervalMs = pollIntervalMs;
    this.clock = clock;
    this.log = log;
    this.running = false;
    this.timer = null;
  }

  // Process at most one job. Returns false when no job was ready.
  async runOnce() {
    const job = this.queue.take(this.clock());
    if (!job) return false;
    const handler = this.handlers[job.type];
    if (!handler) {
      this.queue.bury(job, new Error(`no handler for ${job.type}`));
      return true;
    }
    const attempt = (job.attempts ?? 0) + 1;
    try {
      await handler(job.payload);
      this.log.info(`job ${job.id} done (attempt ${attempt})`);
    } catch (error) {
      this.log.warn(`job ${job.id} failed (attempt ${attempt}/${this.maxAttempts}): ${error.message}`);
      const next = { ...job, attempts: attempt };
      if (attempt >= this.maxAttempts) {
        this.queue.bury(next, error);
      } else {
        const delayMs = this.baseDelayMs * 2 ** (attempt - 1);
        this.queue.push(next, { delayMs, now: this.clock() });
      }
    }
    return true;
  }

  // Process ready jobs until none is ready or the limit is reached.
  async drain(limit = Infinity) {
    let processed = 0;
    while (processed < limit && await this.runOnce()) processed += 1;
    return processed;
  }

  start() {
    if (this.running) return;
    this.running = true;
    const tick = async () => {
      try {
        await this.drain();
      } finally {
        if (this.running) this.timer = setTimeout(tick, this.pollIntervalMs);
      }
    };
    this.timer = setTimeout(tick, 0);
  }

  stop() {
    this.running = false;
    clearTimeout(this.timer);
    this.timer = null;
  }
}
