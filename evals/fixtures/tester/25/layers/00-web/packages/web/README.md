# @records/web

The records page of the admin tool: plain ES modules loaded by `index.html`,
no build step. The page talks to the records service under `/api`.

## Tests

    pnpm --filter @records/web test

Component tests use `node:test` with the small in-memory DOM in
`test/support/dom.js` (`createDocument`, `getByRole`, `flush`). Components
take the `document` they render into, so tests pass the in-memory one.
