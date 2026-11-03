const reports = new Map();
let nextId = 1;

export function resetStore() {
  reports.clear();
  nextId = 1;
}

export function createReport({ title, rows = [] }) {
  const report = { id: nextId++, title, status: 'draft', rows };
  reports.set(report.id, report);
  return report;
}

export function getReport(id) {
  return reports.get(id) ?? null;
}

export function listReports({ status } = {}) {
  const all = [...reports.values()];
  return status ? all.filter((report) => report.status === status) : all;
}

export function publishReport(id) {
  const report = reports.get(id);
  report.status = 'published';
  return report;
}
