# invoice-summary

Helpers that total invoices and render one-line summaries for the monthly
report.

- `src/summary.js`: `invoiceTotal(lines)` and `summaryLine(invoice)`.
- `src/report.js`: `monthlyReport(invoices)`, one summary line per invoice.

Run the tests with `npm test` (Node 22, no dependencies).
