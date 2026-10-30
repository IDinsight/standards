# invoices

Invoice arithmetic for the billing service. Every invoice has a `number`, an
ISO 4217 `currency` code, and `lines` of `{ quantity, unitPrice }`, with
amounts in major currency units (dollars, not cents).

- `src/totals.js`: `lineTotal(line)` and `invoiceTotal(invoice)`.
- `src/invoice.js`: `summarize(invoice)` returns
  `{ number, currency, lineCount, total }`.

Run the tests from the project root with `node --test test/totals.test.js`
(the `test` script in `package.json` runs the same command).
