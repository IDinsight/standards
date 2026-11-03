CREATE TABLE invoices (
  id INTEGER PRIMARY KEY,
  customer TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  issued_on TEXT NOT NULL
);
