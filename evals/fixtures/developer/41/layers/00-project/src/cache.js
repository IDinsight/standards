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

  invalidate(key) {
    this.entries.delete(key);
  }

  clear() {
    this.entries.clear();
  }
}
