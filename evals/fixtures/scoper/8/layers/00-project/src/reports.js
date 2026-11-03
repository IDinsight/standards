import { canView } from './access.js';

export class NotFound extends Error {}
export class Forbidden extends Error {}

export function getReport(store, user, id) {
  const report = store.reports.get(id);
  if (!report) throw new NotFound(`report ${id}`);
  if (!canView(user, report)) throw new Forbidden(`report ${id}`);
  return report;
}

export function listReports(store, user) {
  return [...store.reports.values()].filter((report) => canView(user, report));
}
