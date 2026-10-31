<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: build-a-command-line-tool-that-totals-20260924T090000Z-3e8b1f6a
-->

# Technical Design

## Context

Greenfield project with no existing implementation. The scope
(`.standards/docs/scope/build-a-command-line-tool-that-totals-20260924T090000Z-3e8b1f6a.md`)
requires a Node.js 22 command-line tool with no third-party packages that
totals a plain-text time log per project. No project references apply.

## Decision

Split the tool into a pure parsing module, a pure summarizing and formatting
module, and a thin command-line entry point, so the parsing and totals logic
can be exercised without spawning processes. Parse the whole file before
printing anything, so a malformed line never produces a partial report. Use
plain JavaScript ES modules and the standard library only.

## Acceptance Coverage

- `AC-001`: `parseLine` and `parseDuration` in `src/parse.js`; per-project
  summing in `summarize` (`src/report.js`).
- `AC-002`: `parseLine` classifies blank, whitespace-only, and comment lines as
  skipped; `summarize` ignores them.
- `AC-003`: sorting in `summarize`, `formatMinutes` and `renderReport` in
  `src/report.js`; output and exit status in `bin/timesheet.js`.
- `AC-004`: `LogError` thrown by `summarize` at the first malformed line;
  `bin/timesheet.js` maps it to standard error and exit status 1 without
  writing a report.

## Components

- `src/parse.js`: `parseDuration(text)` and `parseLine(line)`; no I/O.
- `src/report.js`: `summarize(text)`, `formatMinutes(total)`,
  `renderReport(rows)`, and `LogError`; no I/O.
- `bin/timesheet.js`: reads the file named by the first argument, prints the
  report or the error, and sets the exit status.

## Interfaces and Contracts

- `parseDuration(text)` returns whole minutes for `<h>h`, `<m>m`, or
  `<h>h<m>m` (digits only; in the combined form minutes are 0 to 59), otherwise
  `null`.
- `parseLine(line)` trims the line; returns `{ skip: true }` when it is empty
  or starts with `#`; returns `{ date, project, minutes }` when the line has
  exactly three whitespace-separated fields with a `YYYY-MM-DD` date and a
  valid duration; otherwise `null`. A trailing comment after the duration is a
  fourth field and makes the line malformed.
- `summarize(text)` splits on LF or CRLF, returns `[project, minutes]` pairs
  sorted by project name with the default `<` string comparison
  (case-sensitive), and throws `LogError` (with a 1-based `lineNumber` that
  counts skipped lines) at the first malformed line.
- `formatMinutes(total)` returns `H:MM`: unpadded hours, minutes padded to two
  digits.
- `renderReport(rows)` joins one `<project>\t<H:MM>` line per row with `\n`.
- Command line: `timesheet <log-file>`. Success: the report plus a trailing
  newline on standard output (nothing for a log without entries), exit 0.
  Malformed line: `timesheet: line <N>: cannot parse "<line>"` on standard
  error, nothing on standard output, exit 1. Missing argument or unreadable
  file: a message on standard error, exit 2.

## Data and Control Flow

`bin/timesheet.js` reads the whole file and passes its text to `summarize`,
which calls `parseLine` for each line and accumulates minutes in a `Map`. Only
after every line has parsed does the entry point render and print the report.

## Technical Acceptance Criteria

- `AC-001`: `parseDuration` yields 120 for `2h`, 45 for `45m`, and 65 for
  `1h05m`, and `null` for non-integer values or combined minutes above 59;
  durations of the same project are summed.
- `AC-002`: skipped lines change neither the totals nor the line numbers used
  in errors.
- `AC-003`: rows are sorted by `<` comparison; totals are rendered as `H:MM`;
  LF and CRLF input give the same result; exit status 0; an empty or
  comment-only log prints nothing.
- `AC-004`: on the first malformed line nothing is written to standard output,
  the error names the 1-based line number, and the exit status is 1.

## Build Plan

1. CREATE `src/parse.js`.
2. CREATE `src/report.js` (depends on step 1).
3. CREATE `bin/timesheet.js` and `package.json` with `"type": "module"` and a
   `bin` entry (depends on step 2).

## Risks and Follow-up

- The whole log is read into memory; acceptable for personal time logs.
