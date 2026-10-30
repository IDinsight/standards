import { Cache } from './cache.js';

export class RecordStore {
  constructor(cache = new Cache()) {
    this.rows = new Map();
    this.nextId = 1;
    this.cache = cache;
  }

  create(fields) {
    const record = { id: this.nextId++, ...fields };
    this.rows.set(record.id, record);
    return { ...record };
  }

  get(id) {
    const key = `record:${id}`;
    const hit = this.cache.get(key);
    if (hit) return { ...hit };
    const record = this.rows.get(id);
    if (!record) return undefined;
    this.cache.set(key, { ...record });
    return { ...record };
  }

  list({ status } = {}) {
    const key = `list:${status ?? 'all'}`;
    const hit = this.cache.get(key);
    if (hit) return hit.map((record) => ({ ...record }));
    const rows = [...this.rows.values()]
      .filter((record) => !status || record.status === status)
      .map((record) => ({ ...record }));
    this.cache.set(key, rows);
    return rows.map((record) => ({ ...record }));
  }

  update(id, fields) {
    const record = this.rows.get(id);
    if (!record) throw new Error(`record ${id} not found`);
    Object.assign(record, fields);
    this.cache.delete(`record:${id}`);
    this.cache.deletePrefix('list:');
    return { ...record };
  }
}
