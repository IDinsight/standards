export class ReportCache {
  constructor() {
    this.entries = new Map();
  }

  get(key) {
    return this.entries.get(key);
  }

  set(key, value) {
    this.entries.set(key, value);
  }

  // Drop every cached report whose key starts with the prefix, so a change to
  // one region's records clears all of that region's views.
  invalidate(prefix) {
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) this.entries.delete(key);
    }
  }

  clear() {
    this.entries.clear();
  }
}
