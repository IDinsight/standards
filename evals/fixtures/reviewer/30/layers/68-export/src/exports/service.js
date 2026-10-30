import { toCsv } from './csv.js';
import { insertRun, markExported, pendingInvoices } from './repository.js';

// Exports every invoice not exported yet. The run and the invoice markers are
// written in one transaction: if any statement fails, the transaction is
// rolled back and the error is rethrown. Returns null when nothing is pending.
export async function runExport(db, { now = () => new Date() } = {}) {
  return db.transaction(async (tx) => {
    const invoices = await pendingInvoices(tx);
    if (invoices.length === 0) return null;
    const runId = await insertRun(tx, { createdAt: now().toISOString(), invoiceCount: invoices.length });
    await markExported(tx, invoices.map((invoice) => invoice.id), runId);
    return { runId, invoiceCount: invoices.length, csv: toCsv(invoices) };
  });
}
