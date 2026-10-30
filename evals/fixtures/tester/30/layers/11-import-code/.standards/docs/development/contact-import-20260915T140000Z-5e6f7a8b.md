<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: contact-import-20260915T140000Z-5e6f7a8b
-->

# Development Plan

`Cycle`: `contact-import-20260915T140000Z-5e6f7a8b` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/contact-import-20260915T140000Z-5e6f7a8b.md`
- `Architecture`: `.standards/docs/specs/contact-import-20260915T140000Z-5e6f7a8b.md`
- `Request`: `Validate contacts loaded from JSON and add saving the directory to a file.`

## Build Steps

### DEV-001 — Reject input that is not an array

`Status`: `DONE` `Depends On`: `NONE`
`Acceptance`: `AC-001`

**Goal**

`loadDirectory` refuses parsed JSON that is not an array.

**Affected Area**

`loadDirectory` in `src/directory.js`.

**Expected Outcome**

An object or scalar file rejects with `<path>: expected a JSON array of
contacts`.

**Self-Check**

Inline sanity script against a temporary file holding a single object; the
promise rejected with the expected message. Assessed `src/directory.js` blob
${BLOB:src/directory.js}.

### DEV-002 — Require id and name on each row

`Status`: `DONE` `Depends On`: `DEV-001`
`Acceptance`: `AC-002`

**Goal**

Each row must be an object with an `id` and a `name`.

**Affected Area**

`loadDirectory` in `src/directory.js`.

**Expected Outcome**

A row without `id` or `name` stops loading with an error.

**Self-Check**

Inline sanity script with a second row lacking `id`; rejected. Same blob as
DEV-001.

### DEV-003 — Reject repeated ids

`Status`: `DONE` `Depends On`: `DEV-002`
`Acceptance`: `AC-002`

**Goal**

A row whose `id` was already loaded stops loading.

**Affected Area**

`loadDirectory` in `src/directory.js`.

**Expected Outcome**

The second row with id c1 rejects with `repeats id c1`.

**Self-Check**

Inline sanity script with two rows sharing id c1; rejected. Same blob as
DEV-001.

### DEV-004 — Row numbers in validation errors

`Status`: `DONE` `Depends On`: `DEV-002, DEV-003`
`Acceptance`: `AC-002`

**Goal**

Validation errors name the file and the 1-based row number.

**Affected Area**

`loadDirectory` in `src/directory.js`.

**Expected Outcome**

Messages read `<path>: row N has no id`, `has no name`, or `repeats id X`.

**Self-Check**

The DEV-002 and DEV-003 sanity runs printed `row 2` in their messages. Same
blob as DEV-001.

### DEV-005 — Normalize emails on load

`Status`: `DONE` `Depends On`: `DEV-001`
`Acceptance`: `AC-003`

**Goal**

String emails are trimmed and lowercased before `add`.

**Affected Area**

`loadDirectory` in `src/directory.js`.

**Expected Outcome**

A row with email with surrounding spaces and mixed case loads as
`ada@example.org`.

**Self-Check**

Inline sanity script; loaded email matched. Same blob as DEV-001.

### DEV-006 — saveDirectory

`Status`: `DONE` `Depends On`: `NONE`
`Acceptance`: `AC-004`

**Goal**

Add `saveDirectory(directory, path)` writing the contacts as indented JSON.

**Affected Area**

`src/directory.js` (new export).

**Expected Outcome**

The written file parses to an array of the directory's contacts.

**Self-Check**

Inline sanity script saved two contacts to a temporary path and parsed the
file. Same blob as DEV-001.

### DEV-007 — Write through a temporary file

`Status`: `DONE` `Depends On`: `DEV-006`
`Acceptance`: `AC-004`

**Goal**

Write `<path>.tmp` first and rename it to `path`.

**Affected Area**

`saveDirectory` in `src/directory.js`.

**Expected Outcome**

No `.tmp` file remains after a successful save; the target is replaced whole.

**Self-Check**

Inline sanity script listed the temporary folder after saving; only the target
file remained. Same blob as DEV-001.

### DEV-008 — Name-sorted save output

`Status`: `DONE` `Depends On`: `DEV-006`
`Acceptance`: `AC-004`

**Goal**

Saved files list contacts in `list()` order, sorted by name.

**Affected Area**

`saveDirectory` in `src/directory.js`.

**Expected Outcome**

Contacts added as Alan Turing then Ada Lovelace are saved Ada first, and the
file loads back to the same `list()`.

**Self-Check**

Inline sanity script compared `list()` before saving and after reloading;
equal. `node --test test/directory.test.js` in the project root: exit 0, 4
passed. Same blob as DEV-001.
