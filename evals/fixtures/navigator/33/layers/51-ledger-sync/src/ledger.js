import { appendFileSync, mkdirSync } from 'node:fs';

const DEFAULT_BASE = 'https://api.ledgerline.io/v1';
const logDir = new URL('../logs/', import.meta.url);

function log(line) {
  mkdirSync(logDir, { recursive: true });
  appendFileSync(new URL('sync.log', logDir), new Date().toISOString() + ' ' + line + '\n');
}

export async function pushInvoice(invoice, options = {}) {
  const baseUrl = options.baseUrl ?? process.env.LEDGERLINE_URL ?? DEFAULT_BASE;
  const apiKey = options.apiKey ?? process.env.LEDGERLINE_KEY ?? '';
  log('POST ' + baseUrl + '/invoices ' + invoice.id);
  const response = await fetch(baseUrl + '/invoices', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + apiKey },
    body: JSON.stringify(invoice),
  });
  log(response.status + ' ' + invoice.id);
  if (!response.ok) throw new Error('ledger rejected ' + invoice.id + ': ' + response.status);
  return response.json();
}
