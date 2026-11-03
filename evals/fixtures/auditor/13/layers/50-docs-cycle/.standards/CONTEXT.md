# Project Context

## Project Baseline

- `mdtoc` is a small Node.js command-line tool that generates a Markdown table
  of contents from a file's headings and can write it between `<!-- toc -->`
  and `<!-- tocstop -->` markers.
- `README.md` documents printing the table of contents and `--write`; it does
  not describe `--check`, `--max-depth`, or `.mdtocrc.json`.

## Stack and Tooling

- Node.js ES modules (`"type": "module"` in `package.json`); no runtime or
  development dependencies.

## Structure and Boundaries

- `bin/mdtoc.js` — CLI entry point: argument parsing, `--write`, `--check`,
  `--max-depth`, exit statuses.
- `src/toc.js` — heading extraction, anchor slugs, rendering, marker
  replacement.
- `src/config.js` — `.mdtocrc.json` loading, defaults, and validation.

## Commands

- `npm test` — runs `node --test` on `test/toc.test.js`, `test/config.test.js`,
  and `test/cli.test.js`.

## Conventions and Constraints

- There is no documentation generator; `README.md` is maintained by hand.

## Testing and Verification Baseline

- `node:test` suites in `test/`; `test/cli.test.js` runs the CLI against
  temporary files.

## Relevant Existing Behavior

- Configuration is read from `.mdtocrc.json` in the current working directory.
  Defaults are `maxDepth: 3` and `bullet: "-"`; `maxDepth` must be an integer
  from 2 to 6 and `bullet` one of `-`, `*`, `+`.
- `--max-depth N` overrides `maxDepth` from the file.
- `--check` exits 1 when the table of contents between the markers differs from
  the generated one; usage, file, and configuration errors exit 2.
- Level-1 headings and headings inside fenced code blocks are left out;
  repeated anchors get `-1`, `-2` suffixes.

## Evidence

- `bin/mdtoc.js`, `src/config.js`, `src/toc.js` — CLI and configuration
  behavior.
- `test/*.test.js`, `package.json` — test layout and the `npm test` script.
- `README.md` — current user-facing documentation.
