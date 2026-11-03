# Project Context

## Project Baseline

- `timesheet` is a small Node.js tool that reads a plain-text timesheet and prints the number of entries and the total time.
- Each line is `<date> <duration> <description words>`; blank lines are ignored.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no dependencies.

## Structure and Boundaries

- `src/duration.js` — `parseDuration` turns `2h`, `45m`, and `1h30m` into minutes and throws on anything else.
- `src/parse.js` — `parseLine` splits one line into fields; `parseEntries` parses a whole file and returns an array of entries.
- `src/cli.js` — `timesheet <file>` entry point; prints totals. It is the only caller of `parseEntries`.

## Commands

- `npm test` — runs `node --test test/duration.test.js test/parse.test.js`.
- `node src/cli.js <file>` — prints `<n> entries, <h>h <m>m`.

## Conventions and Constraints

- Errors are thrown as plain `Error` objects with a short message.
- Test files are listed explicitly in the `test` script.

## Testing and Verification Baseline

- `test/duration.test.js` covers hours, minutes, both together, and two rejected forms.
- `test/parse.test.js` covers one plain entry.

## Relevant Existing Behavior

- `parseEntries` stops at the first malformed line, because errors from `parseLine` propagate out of it.
- `parseLine` does not check the date or the number of words, and `#` words stay in the description.

## Evidence

- `src/parse.js`, `src/duration.js`, `src/cli.js`, `package.json`.
- `node --test test/duration.test.js test/parse.test.js` in the project root: exit 0, 6 passed.
