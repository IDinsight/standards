import { applyAdminUpdate, createAdminRecord } from './adminRecords.js';

export class AdminStore {
  #records = new Map();

  add(fields) {
    const record = createAdminRecord(fields);
    this.#records.set(record.id, record);
    return record;
  }

  get(id) {
    return this.#records.get(id) ?? null;
  }

  update(id, patch, now) {
    const current = this.get(id);
    if (!current) return null;
    const next = applyAdminUpdate(current, patch, now);
    this.#records.set(id, next);
    return next;
  }
}
