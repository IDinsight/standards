export function parseListQuery(query = {}) {
  const filters = {};
  if (query.status !== undefined) filters.status = query.status;
  if (query.assignee !== undefined) filters.assignee = query.assignee;
  return filters;
}
