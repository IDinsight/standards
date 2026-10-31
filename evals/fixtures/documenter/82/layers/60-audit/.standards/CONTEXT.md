# Project Context

## Project Baseline

- `hours` is a small Node.js command that adds up timesheet hours per person
  from a CSV export. Its user guide is `docs/guide.md`; `README.md` and
  `CONTRIBUTING.md` are the entry points for users and contributors.

## Stack and Tooling

- Node.js 22 or later (`engines` in `package.json`), plain ES modules, no
  dependencies.

## Structure and Boundaries

- `bin/hours.js` — command entry: argument handling, file reading, output, and
  exit statuses.
- `src/summarize.js` — CSV parsing and row validation (`parseCsv`), per-person
  totals sorted by name (`summarize`), table formatting (`formatTable`).
- `examples/week.csv` — sample input used by the guide's examples.
- `docs/guide.md` — guide for people who run the command.
- `scripts/check-docs.js` — documentation check (see Commands).

## Commands

- `npm test` — runs `node --test test/summarize.test.js`.
- `npm run docs:check` — runs `node scripts/check-docs.js`: checks relative
  links in `README.md`, `CONTRIBUTING.md`, and `docs/*.md`, and runs every
  `console` block's `$ ` commands from the repository root, comparing standard
  output with the output the document shows. Exits 1 on any mismatch.

## Conventions and Constraints

- Commands and example paths are relative to the repository root.
- Guide examples are executable through `npm run docs:check` and must keep it
  passing.
- `CONTRIBUTING.md` asks that behavior changes update the guide in the same
  change.

## Testing and Verification Baseline

- `test/summarize.test.js` covers totals and ordering, extra columns and column
  order, trimming, blank lines, CRLF, empty and header-only input, header and
  row validation messages, and two-decimal formatting.
- No automated tests cover `bin/hours.js` argument handling or exit statuses;
  that behavior is established by reading the source.

## Relevant Existing Behavior

- The guide, README, and CONTRIBUTING describe the current command; no
  behavior changes are in progress.

## Evidence

- `bin/hours.js`, `src/summarize.js` — command behavior.
- `test/summarize.test.js`, `package.json` — tests and commands.
- `scripts/check-docs.js` — documentation check behavior.
- `git log` — the guide and docs check were added after the command.
