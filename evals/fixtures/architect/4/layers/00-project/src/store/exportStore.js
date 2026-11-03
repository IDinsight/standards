import { randomUUID } from 'node:crypto';

export class ExportStore {
  #records = new Map();

  create({ report, callbackUrl }) {
    const record = { id: randomUUID(), report, callbackUrl, status: 'queued', createdAt: new Date().toISOString() };
    this.#records.set(record.id, record);
    return { ...record };
  }

  get(id) {
    const record = this.#records.get(id);
    return record ? { ...record } : null;
  }

  update(id, changes) {
    const record = this.#records.get(id);
    if (!record) return null;
    Object.assign(record, changes, { updatedAt: new Date().toISOString() });
    return { ...record };
  }

  // Removes finished exports created before the given ISO timestamp.
  purgeBefore(iso) {
    let removed = 0;
    for (const [id, record] of this.#records) {
      if (record.createdAt < iso && (record.status === 'done' || record.status === 'failed')) {
        this.#records.delete(id);
        removed += 1;
      }
    }
    return removed;
  }
}
