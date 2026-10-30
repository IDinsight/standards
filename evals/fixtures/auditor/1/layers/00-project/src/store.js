import { existsSync, readFileSync, writeFileSync } from 'node:fs';

// Expense records kept in memory, optionally persisted to a JSON file.
export class ExpenseStore {
  constructor({ file = null, records = [] } = {}) {
    this.file = file;
    const initial = file && existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : records;
    this.records = initial.map((record) => ({ ...record }));
    this.nextId = this.records.reduce((max, record) => Math.max(max, record.id), 0) + 1;
  }

  list({ ownerId = null, from = null, to = null, category = null } = {}) {
    return this.records
      .filter((record) => ownerId === null || record.ownerId === ownerId)
      .filter((record) => from === null || record.date >= from)
      .filter((record) => to === null || record.date <= to)
      .filter((record) => category === null || record.category === category)
      .sort((a, b) => (a.date === b.date ? a.id - b.id : a.date < b.date ? -1 : 1))
      .map((record) => ({ ...record }));
  }

  get(id) {
    const record = this.records.find((candidate) => candidate.id === id);
    return record ? { ...record } : null;
  }

  add(ownerId, value) {
    const record = { id: this.nextId, ownerId, ...value };
    this.nextId += 1;
    this.records.push(record);
    this.save();
    return { ...record };
  }

  save() {
    if (this.file) writeFileSync(this.file, `${JSON.stringify(this.records, null, 2)}\n`);
  }
}
