import { withTimeout } from './timeout.js';

// Limits concurrent requests to the rates provider. A caller acquires a slot
// before each request and releases it when the request settles.
export class Pool {
  constructor({ size, acquireTimeoutMs }) {
    this.size = size;
    this.acquireTimeoutMs = acquireTimeoutMs;
    this.inUse = 0;
    this.waiters = [];
  }

  acquire() {
    if (this.inUse < this.size) {
      this.inUse += 1;
      return Promise.resolve();
    }
    let grant;
    const granted = new Promise((resolve) => {
      grant = resolve;
      this.waiters.push(grant);
    });
    return withTimeout(granted, this.acquireTimeoutMs, () => {
      const index = this.waiters.indexOf(grant);
      if (index !== -1) this.waiters.splice(index, 1);
    });
  }

  release() {
    const next = this.waiters.shift();
    if (next) next();
    else this.inUse -= 1;
  }
}
