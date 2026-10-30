const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Collects records into batches and sends them with a fixed number of
// concurrent requests. add() resolves once a full batch has a send slot, so a
// caller that awaits it stops reading while every slot is busy.
export class Batcher {
  constructor({ batchSize, maxInFlight, flushIntervalMs, maxRetries = 0, retryDelayMs = 0, send }) {
    this.batchSize = batchSize;
    this.maxInFlight = maxInFlight;
    this.flushIntervalMs = flushIntervalMs;
    this.maxRetries = maxRetries;
    this.retryDelayMs = retryDelayMs;
    this.send = send;
    this.buffer = [];
    this.inFlight = new Set();
    this.queue = Promise.resolve();
    this.timer = null;
    this.failed = [];
    this.stats = { batches: 0, records: 0, retries: 0 };
  }

  async add(record) {
    this.buffer.push(record);
    if (this.buffer.length >= this.batchSize) {
      await this.#flush();
    } else if (!this.timer && this.flushIntervalMs > 0) {
      this.timer = setTimeout(() => {
        this.timer = null;
        this.#flush();
      }, this.flushIntervalMs);
    }
  }

  #flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.buffer.length === 0) return this.queue;
    const batch = this.buffer;
    this.buffer = [];
    this.queue = this.queue.then(() => this.#dispatch(batch));
    return this.queue;
  }

  async #dispatch(batch) {
    while (this.inFlight.size >= this.maxInFlight) {
      await Promise.race(this.inFlight);
    }
    const task = this.#sendWithRetry(batch).finally(() => this.inFlight.delete(task));
    this.inFlight.add(task);
  }

  async #sendWithRetry(batch) {
    for (let attempt = 0; ; attempt += 1) {
      try {
        await this.send(batch);
        this.stats.batches += 1;
        this.stats.records += batch.length;
        return;
      } catch (error) {
        if (attempt >= this.maxRetries) {
          this.failed.push({ batch, error });
          return;
        }
        this.stats.retries += 1;
        await sleep(this.retryDelayMs * 2 ** attempt);
      }
    }
  }

  async drain() {
    await this.#flush();
    await Promise.all(this.inFlight);
  }
}
