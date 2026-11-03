import { filterEntries, parseFilters } from '../auditLog.js';
import { canViewAuditLog } from '../permissions.js';

export function handleAuditView(user, query, log) {
  if (!canViewAuditLog(user)) {
    return { status: 403, headers: {}, body: { error: 'forbidden' } };
  }
  const entries = filterEntries(log.all(), parseFilters(query));
  return { status: 200, headers: { 'content-type': 'application/json' }, body: { entries } };
}
