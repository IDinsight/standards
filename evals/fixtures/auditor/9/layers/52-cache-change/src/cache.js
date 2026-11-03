export class TtlCache {
  constructor({ ttlMs = 60_000, now = () => Date.now() } = {}) {
    this.ttlMs = ttlMs;
    this.now = now;
    this.entries = new Map();
  }

  get(key) {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value) {
    this.entries.set(key, { value, expiresAt: this.now() + this.ttlMs });
  }

  delete(key) {
    return this.entries.delete(key);
  }

  invalidatePrefix(prefix) {
    let removed = 0;
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) {
        this.entries.delete(key);
        removed += 1;
      }
    }
    return removed;
  }

  clear() {
    this.entries.clear();
  }
}
