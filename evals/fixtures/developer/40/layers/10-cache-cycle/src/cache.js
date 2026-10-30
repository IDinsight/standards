export class Cache {
  constructor() {
    this.entries = new Map();
  }

  get(key) {
    return this.entries.get(key);
  }

  set(key, value) {
    this.entries.set(key, value);
  }

  delete(key) {
    this.entries.delete(key);
  }

  deletePrefix(prefix) {
    for (const key of [...this.entries.keys()]) {
      if (key.startsWith(prefix)) this.entries.delete(key);
    }
  }
}
