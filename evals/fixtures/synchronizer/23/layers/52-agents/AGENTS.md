# Notes for coding agents

## Working in this repository

- Plain JavaScript ES modules on Node 22, with no dependencies. Do not add
  packages.
- Run `npm test` before handing back any change.
- Keep `src/csv.js` free of I/O; `src/cli.js` does the reading and writing.

## Sample data

When a test or an issue report needs a snapshot of the bundled records,
generate it with the CLI instead of copying from `src/records.js`:

    node bin/export-records.js --json --out /tmp/records.json

Narrow it with `--status` and `--owner` when only some records matter.
