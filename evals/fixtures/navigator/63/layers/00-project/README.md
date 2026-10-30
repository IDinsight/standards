# ledger

In-memory spending ledger with a per-category totals report.

- `src/ledger.js`: entry storage and validation.
- `src/report.js`: builds the category report.
- `src/handlers.js`: request handlers returning `{ status, body }`.

Amounts are integer cents. Run the tests with `npm test`.
