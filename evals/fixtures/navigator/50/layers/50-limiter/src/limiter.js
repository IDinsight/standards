// Token bucket: holds up to `capacity` tokens and refills continuously.
export class TokenBucket {
  constructor({ capacity, refillPerSecond, now = () => Date.now() }) {
    this.capacity = capacity;
    this.refillPerSecond = refillPerSecond;
    this.now = now;
    this.tokens = capacity;
    this.updatedAt = now();
  }

  refill() {
    const current = this.now();
    const elapsedSeconds = (current - this.updatedAt) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSeconds * this.refillPerSecond);
    this.updatedAt = current;
  }

  tryTake(count = 1) {
    this.refill();
    if (this.tokens < count) return false;
    this.tokens -= count;
    return true;
  }
}
