const unauthorized = () => ({ status: 401, body: { error: 'sign in required' } });
const forbidden = () => ({ status: 403, body: { error: 'forbidden' } });
const notFound = () => ({ status: 404, body: { error: 'not found' } });

export function createReport(store, user, input) {
  if (!user) return unauthorized();
  const title = typeof input?.title === 'string' ? input.title.trim() : '';
  if (!title) return { status: 400, body: { error: 'title is required' } };
  const report = store.create({ ownerId: user.id, title, body: String(input.body ?? '') });
  return { status: 201, body: report };
}

export function getReport(store, user, id) {
  if (!user) return unauthorized();
  const report = store.get(id);
  if (!report) return notFound();
  if (report.ownerId !== user.id) return forbidden();
  return { status: 200, body: report };
}

export function listReports(store, user) {
  if (!user) return unauthorized();
  return { status: 200, body: store.listByOwner(user.id) };
}
