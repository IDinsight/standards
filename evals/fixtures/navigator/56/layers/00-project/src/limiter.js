export class TokenBucket {
  constructor({ capacity, refillPerInterval, intervalMs, now = Date.now }) {
    this.capacity = capacity;
    this.refillPerInterval = refillPerInterval;
    this.intervalMs = intervalMs;
    this.now = now;
    this.tokens = capacity;
    this.lastRefill = now();
  }

  refill() {
    const elapsed = this.now() - this.lastRefill;
    const intervals = Math.floor(elapsed / this.intervalMs);
    if (intervals === 0) return;
    this.tokens = Math.min(this.capacity, this.tokens + intervals * this.refillPerInterval);
    this.lastRefill += intervals * this.intervalMs;
  }

  tryTake(count = 1) {
    this.refill();
    if (this.tokens < count) return false;
    this.tokens -= count;
    return true;
  }
}
