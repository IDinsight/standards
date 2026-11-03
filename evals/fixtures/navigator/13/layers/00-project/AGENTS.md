# Agent notes

- Node 22, ES modules, no runtime dependencies. Keep it that way.
- All money is integer cents; tax rates are basis points (825 = 8.25%).
- Run tests with `npm test` (node:test).
- Keep `src/cli.js` thin; calculation logic belongs in `src/totals.js` and
  formatting in `src/money.js`.
