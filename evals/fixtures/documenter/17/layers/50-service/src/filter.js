import { HttpError } from './errors.js';

const STATUSES = ['active', 'archived'];

// Builds a store filter from request query parameters. Unknown parameters are
// ignored; blank values mean no filter on that field.
export function parseFilter(query) {
  const filter = {};
  const status = query.status?.trim();
  if (status) {
    if (!STATUSES.includes(status)) throw new HttpError(400, `unknown status: ${status}`);
    filter.status = status;
  }
  const owner = query.owner?.trim();
  if (owner) filter.owner = owner;
  const q = query.q?.trim();
  if (q) filter.q = q;
  return filter;
}
