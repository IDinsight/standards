import { toInvoice } from '../invoices/repository.js';

export class ExportConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ExportConflictError';
  }
}

export async function pendingInvoices(tx) {
  const { rows } = await tx.execute(
    'SELECT id, customer, amount_cents, issued_on FROM invoices WHERE export_run_id IS NULL ORDER BY id',
  );
  return rows.map(toInvoice);
}

export async function insertRun(tx, { createdAt, invoiceCount }) {
  const { lastInsertRowid } = await tx.execute(
    'INSERT INTO export_runs (created_at, invoice_count) VALUES (?, ?)',
    [createdAt, invoiceCount],
  );
  return lastInsertRowid;
}

// Points each invoice at runId. An invoice that another run has already
// marked stops the export, so no invoice is exported twice.
export async function markExported(tx, invoiceIds, runId) {
  for (const id of invoiceIds) {
    const { changes } = await tx.execute(
      'UPDATE invoices SET export_run_id = ? WHERE id = ? AND export_run_id IS NULL',
      [runId, id],
    );
    if (changes !== 1) throw new ExportConflictError(`invoice ${id} was exported by another run`);
  }
}
