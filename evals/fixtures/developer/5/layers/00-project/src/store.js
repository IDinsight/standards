import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export class ReportStore {
  constructor(file = null) {
    this.file = file;
    this.data = { nextId: 1, reports: {} };
    if (file && existsSync(file)) this.data = JSON.parse(readFileSync(file, 'utf8'));
  }

  #flush() {
    if (this.file) writeFileSync(this.file, JSON.stringify(this.data, null, 2));
  }

  create({ ownerId, title, body }) {
    const id = String(this.data.nextId++);
    const report = { id, ownerId, title, body, createdAt: new Date().toISOString() };
    this.data.reports[id] = report;
    this.#flush();
    return report;
  }

  get(id) {
    return this.data.reports[id] ?? null;
  }

  listByOwner(ownerId) {
    return Object.values(this.data.reports).filter((report) => report.ownerId === ownerId);
  }
}
