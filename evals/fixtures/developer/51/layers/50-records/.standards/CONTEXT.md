# Project Context

## Project Baseline

- `contacts-api` is a small contacts service: a JSON API over an in-memory
  store plus a static contacts page that lists every contact.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/store.js` — `createStore(initial)` in-memory store with `list`, `get`,
  and `add`; returns copies, never internal objects.
- `src/app.js` — `createApp(store)` returns a pure request handler
  `handle({ method, url, body })` that returns `{ status, headers, body }`;
  all API routing lives here.
- `src/server.js` — `node:http` adapter; serves `public/` assets for `/` and
  `/static/contacts.js` and passes everything else to the handler.
- `public/` — the contacts page (`contacts.html`, `contacts.js`), which fetches
  `GET /contacts` and renders the list.

## Commands

- `npm test` — runs `node --test test/contacts.test.js test/store.test.js`.
- `npm start` — serves the API and page on port 3000 (`PORT` overrides).

## Conventions and Constraints

- JSON responses go through the local `json(status, body)` helper in
  `src/app.js`; errors use `{ "error": "<message>" }`.
- Unknown routes return 404 `{ "error": "not found" }`.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict`; tests call the handler from
  `createApp()` directly with a fresh seeded store, no server needed.
- The test script lists test files explicitly; new test files must be added to
  it.
- There are no browser tests; the page is checked by hand with `npm start`.

## Relevant Existing Behavior

- `GET /contacts`, `GET /contacts/<id>`, and `POST /contacts` responses must
  stay unchanged.
- The seed data has four contacts (Ada Lovelace, Grace Hopper, Alan Turing,
  Katherine Johnson).

## Evidence

- `src/app.js`, `src/store.js`, `src/server.js`, `public/contacts.js` — routing,
  storage, serving, and page behavior.
- `npm test` — 7 tests passing on the pre-cycle tree.
