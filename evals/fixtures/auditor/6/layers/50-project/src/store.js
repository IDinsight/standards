export class ReportStore {
  constructor() {
    this.reports = new Map();
    this.nextId = 1;
  }

  create(ownerId, title, rows) {
    const report = { id: String(this.nextId), ownerId, title, rows };
    this.nextId += 1;
    this.reports.set(report.id, report);
    return report;
  }

  get(id) {
    return this.reports.get(id) ?? null;
  }
}
