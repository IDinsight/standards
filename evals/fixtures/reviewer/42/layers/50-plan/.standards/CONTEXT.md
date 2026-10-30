# Project Context

## Project Baseline

- `records-api` is a small in-memory JSON API over person records (`id`,
  `name`, `email`) used by internal admin tools. It currently exposes
  `GET /records` only.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/handlers.js` — `handle(method, url, store)` routes requests and returns
  `{ status, body }`; the only routing boundary.
- `src/records.js` — `listRecords(store, params)` implements `GET /records`
  and its paging.
- `src/store.js` — `createStore(records)`, an in-memory store with `all()` and
  `add()`.
- `src/server.js` — wires `handle` to `node:http` and loads
  `data/records.json`.
- `docs/api.md` — the public API contract, including the shared Paging rules.

## Commands

- `npm test` — runs `node --test` with the test files listed in
  `package.json`.
- `npm start` — serves on `PORT` (default 3000).

## Conventions and Constraints

- Handlers are pure functions over a store and return `{ status, body }`;
  HTTP details stay in `src/server.js`.
- Paged endpoints follow docs/api.md "Paging": `page` defaults to 1;
  `pageSize` defaults to 20 with a maximum of 50, and larger values are treated
  as 50. Responses are `{ items, page, pageSize, total }`, with `pageSize`
  reporting the size applied.
- Non-GET requests return 405; unknown paths return 404.

## Testing and Verification Baseline

- `test/records.test.js` (node:test) covers list defaults, the 50-item cap,
  later pages, 405, and 404. Tests call `handle` directly; no server is
  started.

## Evidence

- `src/records.js`, `src/handlers.js`, `docs/api.md`, `test/records.test.js`,
  and `package.json` as of the commit `Initial records API`.
- `npm test` in the project root: exit 0, 5 tests passed.
