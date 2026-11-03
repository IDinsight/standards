import { invoicesToCsv } from './csv.js';
import { findInvoice, listInvoices } from './invoices.js';
import { serializeInvoice } from './serialize.js';

function json(status, payload) {
  return { status, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) };
}

export function handle(method, url) {
  if (method !== 'GET') return json(405, { error: 'method not allowed' });
  const { pathname, searchParams } = new URL(url, 'http://localhost');
  if (pathname === '/invoices') {
    const status = searchParams.get('status') ?? undefined;
    return json(200, { invoices: listInvoices({ status }).map(serializeInvoice) });
  }
  if (pathname === '/invoices/export.csv') {
    return { status: 200, headers: { 'content-type': 'text/csv; charset=utf-8' }, body: invoicesToCsv(listInvoices()) };
  }
  const match = /^\/invoices\/([^/]+)$/.exec(pathname);
  if (match) {
    const invoice = findInvoice(decodeURIComponent(match[1]));
    return invoice ? json(200, serializeInvoice(invoice)) : json(404, { error: 'invoice not found' });
  }
  return json(404, { error: 'not found' });
}
