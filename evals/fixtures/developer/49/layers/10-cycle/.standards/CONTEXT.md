# Project Context

## Project Baseline

- `shelf` is a small book-catalog web app: a read-only JSON API over a bundled
  list of books and a static page that lists them. There is no search today.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  dev dependencies.
- Tests use `node:test` with `node:assert/strict`.

## Structure and Boundaries

- `data/books.json` — bundled catalog; each book has `id`, `title`, `author`,
  `year`.
- `src/catalog.js` — `createCatalog(books)` returns `{ list(), get(id) }`;
  `loadCatalog()` reads the bundled data.
- `src/routes.js` — `route(catalog, method, url)` handles `/api/` paths and
  returns `{ status, type, body }`; it returns `null` for other paths so the
  server falls through to static files.
- `src/app.js` — `createApp(catalog)` builds the `node:http` server: API first,
  then a fixed allow-list of files from `public/`.
- `src/server.js` — starts the server on `PORT` (default 3000).
- `public/` — `index.html`, `app.js`, `style.css`; the page fetches
  `/api/books` and renders one list item per book.

## Commands

- `npm test` — runs `node --test test/catalog.test.js test/routes.test.js`;
  test files are listed explicitly in `package.json`.
- `npm start` — runs the server locally.

## Conventions and Constraints

- API responses are JSON with `content-type: application/json`; errors are
  `{ "error": "<message>" }` with a 4xx status.
- Only `GET` is accepted on `/api/` paths; other methods get 405.
- `/api/books/:id` matches any single path segment after `/api/books/` and
  looks it up as a numeric id.

## Testing and Verification Baseline

- `test/catalog.test.js` covers `list`, `get`, and `loadCatalog`;
  `test/routes.test.js` covers listing, lookup by id, unknown id, 405, and
  fall-through for non-API paths.
- The page has no automated tests, and no browser is available in this
  environment.

## Evidence

- `package.json`, `src/`, `public/`, `test/` — structure, commands, and
  behavior above.
- `node --test test/catalog.test.js test/routes.test.js` — passes on the
  audited revision.
