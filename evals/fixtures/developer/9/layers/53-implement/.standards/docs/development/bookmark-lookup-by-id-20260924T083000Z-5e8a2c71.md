<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: bookmark-lookup-by-id-20260924T083000Z-5e8a2c71
-->

# Development Plan

`Cycle`: `bookmark-lookup-by-id-20260924T083000Z-5e8a2c71` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/bookmark-lookup-by-id-20260924T083000Z-5e8a2c71.md`
- `Architecture`: `.standards/docs/specs/bookmark-lookup-by-id-20260924T083000Z-5e8a2c71.md`
- `Request`: `Bookmark lookup by id`

## Build Steps

### DEV-001 — Store lookup by id

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

Let the JSON file store return one bookmark by its numeric id.

**Affected Area**

`src/store.js` (`createStore`).

**Expected Outcome**

`store.getById(id)` returns the stored bookmark whose `id` equals the given
number, or `null` when none matches. Read or parse failures of the data file
propagate as thrown errors.

**Self-Check**

`node --test test/bookmarks.test.js` in the project root on the working tree
(`src/store.js` modified on top of ${COMMIT:Plan bookmark lookup}): exit 0,
2 passed. Ad hoc `node --input-type=module -e` script against a temporary data
file holding ids 1 and 2: `getById(2)` returned the stored bookmark,
`getById(9)` returned `null`.

### DEV-002 — GET /bookmarks/:id handler and route

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002`

**Goal**

Expose the lookup as a route handler and wire it into the HTTP server.

**Affected Area**

`src/routes/bookmarks.js` (`createBookmarkRoutes` gains `get(rawId)` and an
injected `logger`, defaulting to `console`); `src/server.js` (route
`GET /bookmarks/:id`).

**Expected Outcome**

`routes.get(rawId)` returns 200 with the stored bookmark unchanged; an id that
is not a positive integer, or is not stored, returns 404
`{ "error": "not_found" }`. `src/server.js` dispatches `GET /bookmarks/<id>` to
it. Existing list and create behavior is unchanged.

**Self-Check**

`node --test test/bookmarks.test.js` in the project root on the working tree
(`src/store.js`, `src/routes/bookmarks.js`, `src/server.js` modified on top of
${COMMIT:Plan bookmark lookup}): exit 0, 2 passed. Ad hoc script on the same
tree: `routes.get('2')` returned 200 with the stored object; `routes.get('9')`,
`routes.get('abc')`, and `routes.get('0')` returned 404 `not_found`. Started
`npm start` with `BOOKMARKS_FILE` pointing at a temporary file and requested
`GET /bookmarks/1` with `curl`: 200 with the bookmark JSON.

**Implementation Notes**

`Number(rawId)` is used for parsing, so `'1.5'`, `''`, and `'abc'` all fall
through to 404.

### DEV-003 — Store failures map to a generic 500

`Status`: `DONE` `Depends On`: `DEV-002` `Acceptance`: `AC-003`

**Goal**

Turn unexpected store failures during lookup into the service's generic error
response while keeping the details in the server log.

**Affected Area**

`get` in `src/routes/bookmarks.js`.

**Expected Outcome**

When `store.getById` throws, `routes.get` calls `logger.error` once with a
message and the original error, and returns status 500 with body exactly
`{ "error": "internal_error" }` and no other properties.

**Self-Check**

Ad hoc script on the same working tree with a stub store whose `getById`
throws `new Error('boom')` and a recording logger: `routes.get('1')` returned
status 500 with `body.error` equal to `internal_error`; the logger recorded one
call. `node --test test/bookmarks.test.js`: exit 0, 2 passed. Limitation: no
automated test covers the lookup yet; formal coverage belongs to Tester.
