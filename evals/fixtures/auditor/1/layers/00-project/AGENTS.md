# Expense tracker: notes for contributors and agents

- No third-party dependencies. Use Node built-ins only (`node:http`,
  `node:fs`, `node:test`).
- Money is stored and passed around as integer cents (`amountCents`). Format
  amounts for display only through `src/format.js`.
- Dates are ISO `YYYY-MM-DD` strings in the submitter's calendar; there are no
  times or time zones.
- Every route goes through `src/auth.js`: members see only their own expenses,
  admins see everyone's.
- Route handlers return `{ status, headers, body }` and never touch the Node
  request or response objects; only `src/server.js` does.
- Run `npm test` before committing.
