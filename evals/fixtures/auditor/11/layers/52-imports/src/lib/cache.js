export class Cache {
  constructor({ ttlMs = 60_000, now = () => Date.now() } = {}) {
    this.ttlMs = ttlMs;
    this.now = now;
    this.entries = new Map();
  }

  get(key) {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expires <= this.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value) {
    this.entries.set(key, { value, expires: this.now() + this.ttlMs });
  }

  delete(key) {
    this.entries.delete(key);
  }

  deletePrefix(prefix) {
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) this.entries.delete(key);
    }
  }
}
