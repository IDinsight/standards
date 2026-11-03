CREATE TABLE export_runs (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL,
  invoice_count INTEGER NOT NULL
);

ALTER TABLE invoices ADD COLUMN export_run_id INTEGER REFERENCES export_runs (id);
