export function createStore() {
  return {
    users: new Map(),
    reports: new Map(),
    sessions: new Map(),
    nextReportId: 1,
  };
}

export function addUser(store, user) {
  store.users.set(user.id, { ...user });
  return store.users.get(user.id);
}

export function addReport(store, { teamId, title, body, ownerId }) {
  const id = store.nextReportId;
  store.nextReportId += 1;
  const report = { id, teamId, title, body, ownerId, createdAt: new Date().toISOString() };
  store.reports.set(id, report);
  return report;
}
