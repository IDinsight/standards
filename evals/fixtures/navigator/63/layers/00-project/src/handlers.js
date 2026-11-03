import { categoryReport } from './report.js';

export function getReport(ledger) {
  return { status: 200, body: { categories: categoryReport(ledger) } };
}

export function postEntry(ledger, body) {
  try {
    ledger.add(body);
    return { status: 201, body: { ok: true } };
  } catch (error) {
    return { status: 400, body: { error: error.message } };
  }
}
