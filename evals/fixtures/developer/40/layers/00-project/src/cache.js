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
}
