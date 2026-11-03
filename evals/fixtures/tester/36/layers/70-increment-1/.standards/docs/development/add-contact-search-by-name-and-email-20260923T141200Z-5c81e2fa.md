<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-contact-search-by-name-and-email-20260923T141200Z-5c81e2fa
-->

# Development Plan

`Cycle`: `add-contact-search-by-name-and-email-20260923T141200Z-5c81e2fa`
`Mode`: `AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`: `INCREMENTAL`
`Current Increment`: `1`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-contact-search-by-name-and-email-20260923T141200Z-5c81e2fa.md`
- `Architecture`: `.standards/docs/specs/add-contact-search-by-name-and-email-20260923T141200Z-5c81e2fa.md`
- `Request`: `Add contact search by name and email.`

## Build Steps

### DEV-001 — Name search on GET /contacts/search

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Serve name search through the new search route as the design's AC-001
contract defines.

**Affected Area**

`src/search.js` (new: `searchByName`) and `src/routes.js` (dispatch
`/contacts/search` before the `/contacts/:id` match).

**Expected Outcome**

`GET /contacts/search?name=<q>` returns `200 { results }` with
case-insensitive substring matches in store order, and `400 { error }` for a
trimmed query shorter than 2 characters or a missing `name`. Existing routes
behave as before.

**Self-Check**

- `node --test test/contacts.test.js` in the project root, on the DEV-001
  working-tree changes over `${COMMIT:Add contact search scope and design}`:
  exit 0, 3 passed, 0 failed.
- `node --input-type=module -e` sanity call in the project root against a
  two-contact store: `?name=an` returned 200 with `Ana Lima` and `Joan Park`;
  `?name=a` returned 400.

Limitation: no automated search tests exist yet; these are implementation
feedback only.

**Implementation Notes**

The search branch is matched before the numeric `/contacts/:id` pattern; the
pattern only accepts digits, so the order is for readability.

### DEV-002 — Email search on the same route

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-002`

**Goal**

Resolve a contact by exact email through `GET /contacts/search?email=<address>`
and reject requests that supply both parameters, as the design's AC-002
contract defines.

**Affected Area**

`src/search.js` (`searchByEmail`) and `src/routes.js` (read `email`, reject
both parameters).

**Expected Outcome**

An email query returns `200 { results }` with zero or one contact, matched
case-insensitively; `name` plus `email` returns 400. Name search is unchanged.

**Self-Check**

Not run yet. Planned: `node --test test/contacts.test.js` and a sanity call for
an email match, a miss, and the both-parameters 400.

## Verification Increments

### Increment 1

`Development Steps`: `DEV-001` `Acceptance`: `AC-001`

**Ready Outcome**

Clients can search contacts by name through `GET /contacts/search?name=<q>` as
AC-001 and the design's AC-001 technical criteria describe.

### Increment 2

`Development Steps`: `DEV-002` `Acceptance`: `AC-002`

**Ready Outcome**

Clients can also resolve a contact by exact email through the same route.

## Plan Notes

- The user approved the plan with style `NONE` and selected `INCREMENTAL`
  cadence at approval. Increment 1 was handed to Tester at checkpoint; DEV-002
  starts after the Increment 1 return.
