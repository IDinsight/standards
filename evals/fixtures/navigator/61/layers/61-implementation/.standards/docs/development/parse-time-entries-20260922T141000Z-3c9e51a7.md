<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: parse-time-entries-20260922T141000Z-3c9e51a7
-->

# Development Plan

`Cycle`: `parse-time-entries-20260922T141000Z-3c9e51a7` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/parse-time-entries-20260922T141000Z-3c9e51a7.md`
- `Architecture`: `.standards/docs/specs/parse-time-entries-20260922T141000Z-3c9e51a7.md`
- `Request`: `Parse tags from timesheet entries and report malformed lines without stopping the run.`

## Build Steps

### DEV-001 — Validate line shape and separate tags in parseLine

`Status`: `DONE` `Depends On`: `NONE`
`Acceptance`: `AC-001, AC-002, AC-003, AC-004`

**Goal**

`parseLine` returns `{ date, minutes, description, tags }` and throws a short `Error` for a line it cannot read.

**Affected Area**

`src/parse.js` (`parseLine`); `src/duration.js` is reused unchanged.

**Expected Outcome**

Words starting with `#` become tags without the `#` and are left out of the description. A line with fewer than three words, a date not shaped `YYYY-MM-DD`, or a duration that `parseDuration` rejects throws with a message naming the problem.

**Self-Check**

`node --test test/duration.test.js test/parse.test.js` in the project root, on the working tree over `${COMMIT:Record context, scope, and design for entry parsing}`: exit 0, 6 passed, 0 failed. A manual `node --input-type=module -e` call of `parseLine('2026-09-21 1h30m sprint planning #ops #meetings')` returned tags `['ops', 'meetings']` and description `sprint planning`.

### DEV-002 — Collect per-line errors in parseEntries and print them in the CLI

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-004`

**Goal**

A malformed line no longer stops parsing; every problem is returned with its line number and shown by the CLI.

**Affected Area**

`src/parse.js` (`parseEntries`), `src/cli.js`.

**Expected Outcome**

`parseEntries` returns `{ entries, errors }`; each error is `{ line, message }` with a 1-based line number counted over every input line, including blank ones. Parsing continues after an error. The CLI prints `line N: message` to stderr for each error, prints totals for the parsed entries, and exits 1 when there were errors.

**Self-Check**

Same test command in the project root: exit 0, 6 passed, 0 failed. `node src/cli.js` on a four-line sample whose second line used `1x` printed `line 2: invalid duration "1x"` to stderr and `3 entries, 3h 30m` to stdout, and exited 1.
