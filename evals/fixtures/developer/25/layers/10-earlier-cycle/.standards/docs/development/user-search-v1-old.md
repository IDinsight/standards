<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: user-search-v1-old
-->

# Development Plan

`Cycle`: `user-search-v1-old` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/user-search-v1-old.md`
- `Architecture`: `.standards/docs/specs/user-search-v1-old.md`
- `Request`: `Add name search to the user directory CLI.`

## Build Steps

### DEV-001 — Name search function

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

Provide a pure function that filters a user list by a query string.

**Affected Area**

`src/search.js` (new).

**Expected Outcome**

`searchUsers(users, query)` returns, in input order, the users whose name
contains the trimmed query; a blank query returns an empty list.

**Self-Check**

`node --test test/users.test.js` in the project root on the working tree with
`src/search.js` added; exit 0, 1 passing. `node -e` spot check of
`searchUsers` with `'Hopper'` and `'   '` returned the expected users.

### DEV-002 — Search from the command line

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-003`

**Goal**

Let `npm start -- <query>` print only matching users.

**Affected Area**

`src/cli.js`.

**Expected Outcome**

With a query argument the CLI prints one `Name <email>` line per match; with no
argument it prints every user as before.

**Self-Check**

`npm start -- Hopper` in the project root printed
`Grace Hopper <ghopper@example.org>`; `npm start` still printed all five users.

## Plan Notes

NONE
