# timesheet

Records time entries (project, date, hours) and keeps a running total of hours
per day.

- `src/entries.js`: `createEntry(store, input)`, the entry point for adding an entry.
- `src/validate.js`: input rules for a time entry.
- `src/store.js`: in-memory `EntryStore` with per-day totals.

Run the tests with `npm test`.
