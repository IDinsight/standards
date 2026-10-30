export function parseListQuery(query = {}) {
  const filters = {};
  if (query.status !== undefined) filters.status = query.status;
  if (query.assignee !== undefined) filters.assignee = query.assignee;
  if (query.due_from !== undefined) filters.due_from = query.due_from;
  if (query.due_to !== undefined) filters.due_to = query.due_to;
  return filters;
}
