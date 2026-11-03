# reports

Regional sales reports: CSV import, per-region totals, and a reports page
rendered as HTML.

- `src/importer.js` parses uploaded CSV into records.
- `src/reports.js` totals amounts by region.
- `src/pages/reports.js` renders the reports page.
- `src/cache.js` caches rendered reports.

Run the tests with `npm test`.
