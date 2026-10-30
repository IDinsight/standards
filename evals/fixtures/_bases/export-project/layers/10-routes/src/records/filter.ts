import { HttpError } from '../http/errors.ts';
import type { RecordFilter, RecordStatus } from './store.ts';

const STATUSES: readonly RecordStatus[] = ['active', 'archived'];

// Builds a store filter from request query parameters. Unknown parameters are
// ignored; blank values mean no filter on that field.
export function parseFilter(query: Record<string, string>): RecordFilter {
  const filter: RecordFilter = {};
  const status = query.status?.trim();
  if (status) {
    if (!STATUSES.includes(status as RecordStatus)) {
      throw new HttpError(400, `unknown status: ${status}`);
    }
    filter.status = status as RecordStatus;
  }
  const owner = query.owner?.trim();
  if (owner) filter.owner = owner;
  const q = query.q?.trim();
  if (q) filter.q = q;
  return filter;
}
