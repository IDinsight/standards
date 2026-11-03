export class ReportStore {
  constructor() {
    this.reports = new Map();
    this.nextId = 1;
  }

  create({ workspaceId, ownerId, title, rows = [] }) {
    const report = { id: this.nextId, workspaceId, ownerId, title, rows };
    this.nextId += 1;
    this.reports.set(report.id, report);
    return report;
  }

  get(id) {
    return this.reports.get(id) ?? null;
  }

  listForWorkspace(workspaceId) {
    return [...this.reports.values()].filter((report) => report.workspaceId === workspaceId);
  }
}
