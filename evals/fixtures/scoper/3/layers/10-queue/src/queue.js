export class JobQueue {
  constructor() {
    this.pending = [];
  }

  enqueue(name, payload = {}) {
    this.pending.push({ name, payload, attempts: 0 });
  }

  size() {
    return this.pending.length;
  }

  // Runs every pending job once; a failing job is retried until maxAttempts.
  // Returns the jobs that could not be run.
  async drain(handlers, { maxAttempts = 3 } = {}) {
    const failed = [];
    while (this.pending.length) {
      const job = this.pending.shift();
      const handler = handlers[job.name];
      if (!handler) {
        failed.push(job);
        continue;
      }
      try {
        await handler(job.payload);
      } catch {
        job.attempts += 1;
        if (job.attempts < maxAttempts) this.pending.push(job);
        else failed.push(job);
      }
    }
    return failed;
  }
}
