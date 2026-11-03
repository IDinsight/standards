# Project Context

## Project Baseline

- `ledger-export` 0.4.0 is a small Node.js command-line tool that turns JSON transaction dumps into CSV or JSON extracts filtered by date range and account. Its users run it from a checkout; it is not published to a registry.
- Documentation is a set of Markdown pages in `docs/`, rendered to a static `site/` by a local script. `docs/` currently holds `index.md` (overview and source map) and `development.md` (contributor setup, tests, docs build). No page explains how to run an export.

## Stack and Tooling

- Node.js 22, ES modules (`"type": "module"`). No runtime or development dependencies; nothing to install.

## Structure and Boundaries

- `src/cli.js` — command-line entry point (`bin`: `ledger-export`): option parsing with `node:util` `parseArgs`, reading the input file, writing output, exit codes.
- `src/export.js` — `selectRecords` (date and account filtering, sorting) and `toCsv` / `toJson` / `render`.
- `examples/transactions.json` — sample input showing the record shape.
- `docs/` — documentation pages; `scripts/build-docs.mjs` and `scripts/check-docs.mjs` build and check them.

## Commands

- `npm test` (`node --test test/export.test.js`) — unit tests for selection and rendering.
- `npm run docs:build` — renders every `docs/*.md` page to `site/<name>.html`.
- `npm run docs:check` — fails when a page does not start with a `# Title` line or links to a page that does not exist.
- `node src/cli.js --input examples/transactions.json --from 2026-09-01 --to 2026-09-30` — sample export to stdout.

## Conventions and Constraints

- Docs generation convention: every Markdown file directly in `docs/` is a page. The build discovers pages itself, takes each title from the first `# ` heading, puts `index.md` first and the others in file-name order, and generates the navigation on every page. Adding a page needs no index, configuration, or navigation edit.
- The renderer supports `#` to `###` headings, paragraphs, `-` lists, fenced code blocks, inline code, and links to other pages written with the `.md` file name. Other Markdown (tables, emphasis) is shown as plain text.
- `site/` is generated output and ignored by git.

## Relevant Existing Behavior

- Options: `--input <file>` (required; a JSON array of records with `date`, `account`, `description`, `amount`), `--from` and `--to` (`YYYY-MM-DD`, both inclusive, either optional), `--account <name>` (exact match), `--format csv|json` (default `csv`), `--out <file>` (write to a file instead of stdout), `--help`.
- Output is sorted by date. CSV has the header `date,account,description,amount`, quotes fields containing commas, double quotes, or newlines, and doubles embedded quotes. JSON is an indented array with the same four fields.
- Exit codes: 0 on success; 2 when `--input` is missing (usage printed to stderr); 1 for other errors such as an unknown format, an unknown option, or an unreadable or invalid input file, with the message prefixed `ledger-export:`.
- Dates are compared as text, so they must be written `YYYY-MM-DD`.

## Testing and Verification Baseline

- `test/export.test.js` covers the inclusive date range and sorting, account filtering, CSV quoting of commas, and rejection of unknown formats. The CLI layer (`src/cli.js`) has no automated tests.

## Evidence

- `src/cli.js`, `src/export.js`, `test/export.test.js`, `examples/transactions.json` — CLI behavior.
- `scripts/build-docs.mjs`, `scripts/check-docs.mjs`, `docs/development.md` — documentation convention.
- `npm test` — 4 passing tests; `npm run docs:check` — `docs ok: 2 pages`; both run at the audited commit.
