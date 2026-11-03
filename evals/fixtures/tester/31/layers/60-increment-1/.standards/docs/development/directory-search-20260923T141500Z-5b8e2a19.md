<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: directory-search-20260923T141500Z-5b8e2a19
-->

# Development Plan

`Cycle`: `directory-search-20260923T141500Z-5b8e2a19` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`:
`INCREMENTAL` `Current Increment`: `1`

## Implementation Contract

- `Scope`: `.standards/docs/scope/directory-search-20260923T141500Z-5b8e2a19.md`
- `Architecture`: `.standards/docs/specs/directory-search-20260923T141500Z-5b8e2a19.md`
- `Request`: `Search the staff directory by part of a name or email address, with paged results.`

## Build Steps

### DEV-001 — Name search in searchUsers

`Status`: `DONE` `Depends On`: `NONE`
`Acceptance`: `AC-001`

**Goal**

Add `searchUsers(users, query)` in `src/search.js` returning the people whose name contains the query, ignoring case, ordered by name (design Build Plan step 1).

**Affected Area**

`src/search.js` (new). Consumes the `{ id, name, email }` records from `loadUsers` in `src/directory.js`.

**Expected Outcome**

`searchUsers` returns each name match ordered by name.

**Self-Check**

`node --input-type=module -e "import { loadUsers } from './src/directory.js'; import { searchUsers } from './src/search.js'; console.log(searchUsers(loadUsers('data/users.json'), 'AD'), searchUsers([], '   '))"` in the project root on `${COMMIT:Record directory search scope and design}` plus the uncommitted `src/search.js`; printed Ada Lovelace then Adele Goldberg, then `[]`; exit 0.

### DEV-002 — Email search and matched field

`Status`: `PENDING` `Depends On`: `DEV-001`
`Acceptance`: `AC-001, AC-002`

**Goal**

Implement design Build Plan step 2: add `src/normalize.js`, move name matching onto it, add email matching, and add `matchedOn` to every result.

**Affected Area**

`src/search.js`, `src/normalize.js` (new).

**Expected Outcome**

One query also matches email addresses; email matches follow name matches, each group ordered by name; every result is `{ id, name, email, matchedOn }`; a person matching on both appears once as a name match.

**Self-Check**

Planned: run `searchUsers` on `data/users.json` with an email-only fragment and with a query that matches both name and email.

### DEV-003 — Paged results

`Status`: `PENDING` `Depends On`: `DEV-002`
`Acceptance`: `AC-003`

**Goal**

Add `paginate(results, { page, size })` in `src/page.js` per the design.

**Affected Area**

`src/page.js` (new).

**Expected Outcome**

Callers get `{ items, page, size, total }` for a 1-based page; pages past the end are empty; invalid arguments throw `RangeError`.

**Self-Check**

Planned: page through the results of a broad query on `data/users.json`.

---

## Verification Increments

### Increment 1

`Development Steps`: `DEV-001` `Acceptance`: `AC-001`

**Ready Outcome**

Searching by part of a person's name, in any letter case, returns the matching people ordered by name.

### Increment 2

`Development Steps`: `DEV-001, DEV-002` `Acceptance`: `AC-001, AC-002`

**Ready Outcome**

One query finds people by part of their name or email address, ignoring case and extra whitespace; every result carries `matchedOn`; name matches, now produced through the shared normalization, come before email matches.

### Increment 3

`Development Steps`: `DEV-003` `Acceptance`: `AC-003`

**Ready Outcome**

Callers can page through search results and see the total number of matches.

---

## Plan Notes

- The user approved this plan, including INCREMENTAL verification, on 2026-09-23; the user style selection NONE is locked.
- Increment 2 lists DEV-001 because design Build Plan step 2 moves name matching onto `normalize()` and adds `matchedOn` to name matches.
