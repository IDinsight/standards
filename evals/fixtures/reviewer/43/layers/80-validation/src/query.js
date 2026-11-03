import { STATUSES } from './store.js';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class QueryError extends Error {
  constructor(parameter, message) {
    super(message);
    this.parameter = parameter;
  }
}

function isCalendarDate(value) {
  if (!DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function parseListQuery(query = {}) {
  const filters = {};
  if (query.status !== undefined) {
    if (!STATUSES.includes(query.status)) {
      throw new QueryError('status', `status must be one of ${STATUSES.join(', ')}`);
    }
    filters.status = query.status;
  }
  if (query.assignee !== undefined) filters.assignee = query.assignee;
  for (const name of ['due_from', 'due_to']) {
    if (query[name] === undefined) continue;
    if (!isCalendarDate(query[name])) {
      throw new QueryError(name, `${name} must be a date in YYYY-MM-DD form`);
    }
    filters[name] = query[name];
  }
  return filters;
}
