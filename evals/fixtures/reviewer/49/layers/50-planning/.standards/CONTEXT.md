# Project Context

## Project Baseline

- `timesheet` is a small command-line tool that totals time entries per
  project from a CSV file and prints hours per project.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/entries.js` — `parseEntries(text)`: CSV lines `date, project, minutes`;
  blank and `#` lines skipped.
- `src/report.js` — `summarize(entries)` totals minutes per project sorted by
  name; `formatReport(rows)` prints `project<TAB>H.HHh` lines.
- `bin/report.js` — CLI entry point; reads one file path argument; exits 2
  with a usage message when it is missing.

## Commands

- `npm test` — runs `node --test` on the files listed in `package.json`.

## Conventions and Constraints

- Dates are ISO `YYYY-MM-DD` strings throughout; no time zones.
- Usage errors exit with status 2 and write to standard error.

## Testing and Verification Baseline

- `test/report.test.js` covers `summarize` totals and `formatReport` output
  with `node:test`. There are no CLI-level tests yet.

## Relevant Existing Behavior

- The report output for a file (sorting, two-decimal hours, trailing newline)
  must stay unchanged for existing callers.

## Evidence

- `src/`, `bin/report.js`, `test/report.test.js`, `package.json`, `README.md`.
