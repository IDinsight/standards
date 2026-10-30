import { randomBytes } from 'node:crypto';

import { getReport } from './reports.js';

export function createShareLink(store, user, reportId) {
  const report = getReport(store, user, reportId);
  const token = randomBytes(16).toString('hex');
  store.shares.set(token, { reportId: report.id, createdBy: user.id, createdAt: new Date().toISOString() });
  return { token, url: `/s/${token}` };
}

export function resolveShareLink(store, token) {
  const share = store.shares.get(token);
  if (!share) return null;
  return store.reports.get(share.reportId) ?? null;
}
