# invoice-render

Renders plain-text invoices for the billing desk and pushes them to Ledgerline.

- `src/render.js`: invoice layout and amount formatting.
- `src/ledger.js`: sends invoices to the Ledgerline API. Set `LEDGERLINE_KEY`
  (and optionally `LEDGERLINE_URL`).
- `scripts/gen-fixtures.mjs`: builds test fixtures from `scripts/seed.mjs`.

Run the tests with `npm test`.
