<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: build-a-command-line-tool-that-totals-20260924T090000Z-3e8b1f6a
-->

# Development Plan

`Cycle`: `build-a-command-line-tool-that-totals-20260924T090000Z-3e8b1f6a`
`Mode`: `AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/build-a-command-line-tool-that-totals-20260924T090000Z-3e8b1f6a.md`
- `Architecture`: `.standards/docs/specs/build-a-command-line-tool-that-totals-20260924T090000Z-3e8b1f6a.md`
- `Request`: `Build a command-line tool that totals time-log minutes per project.`

## Build Steps

### DEV-001 — Parse entry lines and durations

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

Turn one log line into a skipped marker, a parsed entry, or a rejection,
following the design's `parseLine` and `parseDuration` contracts.

**Affected Area**

`src/parse.js` (created).

**Expected Outcome**

`parseDuration` returns whole minutes for the three duration forms and `null`
otherwise; `parseLine` returns `{ skip: true }`, `{ date, project, minutes }`,
or `null`.

**Self-Check**

From the project root, on the working tree committed together with this plan:
`node -e "import('./src/parse.js').then((m) => console.log(m.parseDuration('1h05m'), m.parseDuration('1h60m'), m.parseLine('# lunch')))"`
printed `65 null { skip: true }`, exit 0. Implementation feedback only, not
formal verification.

### DEV-002 — Summarize and format totals

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-003, AC-004`

**Goal**

Accumulate minutes per project, sort the rows, format `H:MM`, and stop at the
first malformed line with its 1-based line number.

**Affected Area**

`src/report.js` (created).

**Expected Outcome**

`summarize` returns sorted `[project, minutes]` pairs or throws `LogError`;
`formatMinutes` and `renderReport` produce the report lines.

**Self-Check**

From the project root, same working tree:
`node -e "import('./src/report.js').then((m) => console.log(JSON.stringify(m.summarize('2026-09-01 b 10m\n2026-09-01 a 1h5m\n')), m.formatMinutes(65)))"`
printed `[["a",65],["b",10]] 1:05`, exit 0.

### DEV-003 — Command-line entry point

`Status`: `DONE` `Depends On`: `DEV-002` `Acceptance`: `AC-003, AC-004`

**Goal**

Read the log file, print the report or the error, and set the exit status the
design defines.

**Affected Area**

`bin/timesheet.js` and `package.json` (created).

**Expected Outcome**

A well-formed log prints sorted totals and exits 0; a malformed line prints
only an error naming the line and exits 1; a missing argument or unreadable
file exits 2.

**Self-Check**

From the project root, same working tree:
`printf '2026-09-01 website 1h30m\n# lunch\n2026-09-02 website 2h\n' > /tmp/ts.log && node bin/timesheet.js /tmp/ts.log`
printed `website` and `3:30` separated by a tab, exit 0;
`printf '2026-09-01 web 1h75m\n' > /tmp/bad.log && node bin/timesheet.js /tmp/bad.log`
printed `timesheet: line 1: cannot parse "2026-09-01 web 1h75m"` on standard
error and nothing on standard output, exit 1; `node bin/timesheet.js` with no
argument printed the usage line, exit 2.

## Plan Notes

- The user approved this plan before implementation; that approval locked User
  Style `NONE`.
- After DEV-001 created `src/parse.js`, `.standards/MODE.md` was changed from
  `GREENFIELD` to `BROWNFIELD`.
- Formal tests are left to Tester.
- Project references loaded: NONE.
