// SQL for the invoices table. Functions take the database or a transaction.

export function toInvoice(row) {
  return { id: row.id, customer: row.customer, amountCents: row.amount_cents, issuedOn: row.issued_on };
}

export async function insertInvoice(db, { customer, amountCents, issuedOn }) {
  const { lastInsertRowid } = await db.execute(
    'INSERT INTO invoices (customer, amount_cents, issued_on) VALUES (?, ?, ?)',
    [customer, amountCents, issuedOn],
  );
  return lastInsertRowid;
}

export async function listInvoices(db) {
  const { rows } = await db.execute('SELECT id, customer, amount_cents, issued_on FROM invoices ORDER BY id');
  return rows.map(toInvoice);
}
