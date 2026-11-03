<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: normalize-note-tags-20260924T090000Z-3f8a2c61
-->

# Development Plan

`Cycle`: `normalize-note-tags-20260924T090000Z-3f8a2c61` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Trim surrounding whitespace and lowercase tag names when a note is saved, drop duplicate tags, and match tag lookups the same way.`

## Build Steps

### DEV-001 — Normalize tag names on save and lookup

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Store every note's tags in one canonical form and look tags up in that same
form.

**Affected Area**

`src/tags.js` (new `normalizeTags`), `src/notes.js` (`saveNote`,
`notesWithTag`), `test/tags.test.js`, `test/notes.test.js`, and the `test`
script in `package.json`.

**Expected Outcome**

Saved notes carry trimmed, lowercase, de-duplicated tags with empty tags
removed; `notesWithTag` matches a query regardless of its case or surrounding
spaces.

**Self-Check**

`npm test` (runs `node --test test/notes.test.js test/tags.test.js`) in the
project root on the working tree before commit: exit 0, 5 tests passed, 0
failed.
