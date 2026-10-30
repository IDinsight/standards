<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: bookmark-lookup-by-id-20260924T083000Z-5e8a2c71
-->

# Development Plan

`Cycle`: `bookmark-lookup-by-id-20260924T083000Z-5e8a2c71` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/bookmark-lookup-by-id-20260924T083000Z-5e8a2c71.md`
- `Architecture`: `.standards/docs/specs/bookmark-lookup-by-id-20260924T083000Z-5e8a2c71.md`
- `Request`: `Bookmark lookup by id`

## Build Steps

### DEV-001 — Store lookup by id

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

Let the JSON file store return one bookmark by its numeric id.

**Affected Area**

`src/store.js` (`createStore`).

**Expected Outcome**

`store.getById(id)` returns the stored bookmark whose `id` equals the given
number, or `null` when none matches. Read or parse failures of the data file
propagate as thrown errors.

**Self-Check**

Planned: `node --test test/bookmarks.test.js` from the project root, plus a
direct `getById` call against a temporary data file for a stored and an unknown
id.

### DEV-002 — GET /bookmarks/:id handler and route

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002`

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

Planned: `node --test test/bookmarks.test.js`, direct handler calls for found,
unknown, and non-numeric ids, and one request against `npm start` with a
temporary data file.

### DEV-003 — Store failures map to a generic 500

`Status`: `PENDING` `Depends On`: `DEV-002` `Acceptance`: `AC-003`

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

Planned: call `routes.get` with a stub store whose `getById` throws and a
recording logger; run `node --test test/bookmarks.test.js`.
