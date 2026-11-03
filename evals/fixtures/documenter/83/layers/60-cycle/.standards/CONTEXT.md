# Project Context

## Project Baseline

- ledgerline is a small Node.js CLI (`src/cli.js`) that totals a CSV ledger by
  account, configured through `ledgerline.json`.
- A user guide in `docs/` is published as a static site generated from
  Markdown.

## Stack and Tooling

- Node.js 22, ES modules (`"type": "module"`); the CLI and its tests use only
  Node built-ins.
- Docs site: `scripts/build-docs.mjs`, configured by `docs.config.json`
  (source `docs/`, output `site/`, and the plugins the build loads in order).

## Structure and Boundaries

- `src/config.js` — option defaults (`DEFAULTS`) and validation (`loadConfig`).
- `src/ledger.js` — ledger parsing (`parseLedger`), totals (`summarize`), and
  amount formatting (`formatAmount`).
- `src/cli.js` — reads `ledgerline.json` (or `--config <path>`) and prints one
  total per account.
- `docs/` — guide pages `index.md`, `getting-started.md`, `configuration.md`.
- `scripts/docs-plugins/anchors.mjs` — local docs plugin that adds heading ids.

## Commands

- `npm test` — runs `node --test test/config.test.js test/ledger.test.js`.
- `npm run docs:build` — runs `node scripts/build-docs.mjs`, rendering
  `docs/*.md` into `site/` (gitignored).

## Conventions and Constraints

- Guide notes are written as `:::note` ... `:::` blocks (since commit "Render
  guide notes as callouts").
- Generated `site/` output is not committed; the Markdown in `docs/` is the
  source.

## Testing and Verification Baseline

- `test/config.test.js` covers defaults, accepted values, and rejection of
  invalid options; `test/ledger.test.js` covers parsing, totals, formatting,
  blank lines, and delimiters.

## Relevant Existing Behavior

- `loadConfig` accepts `currency`, `dateFormat`, `roundTo`, `skipEmptyRows`, and
  `delimiter`, rejects unknown keys and invalid values with an error naming the
  option; the CLI prints `ledgerline: <message>` and exits 1.
- `docs/configuration.md` describes `currency`, `dateFormat` (two formats), and
  `skipEmptyRows`. `roundTo`, `delimiter`, and the `MM/DD/YYYY` date format are
  accepted by `loadConfig` but not described in the guide.

## Known Unknowns

- The docs build was not run during this audit.

## Evidence

- `src/config.js`, `src/ledger.js`, `src/cli.js`, `test/config.test.js`,
  `test/ledger.test.js` — option set and behavior.
- `docs.config.json`, `scripts/build-docs.mjs` — docs build pipeline.
- `git log` — "Add MM/DD/YYYY date format and delimiter option" postdates the
  guide.
