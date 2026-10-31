# Project Context

## Project Baseline

- `rotalog` is a small Node.js ES module library that rotates an application
  log file into numbered backups. Implementation lives in `src/rotate.js`;
  `README.md` is the only existing documentation and has no configuration
  details.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no
  dependencies.

## Structure and Boundaries

- `src/rotate.js` — exports `DEFAULTS`, `shouldRotate`, `rotate`, and
  `rotateIfNeeded`.
- `test/rotate.test.js` — `node:test` coverage of the size threshold, backup
  shifting, and `keep` validation.
- `README.md` — short overview and a usage snippet.

## Commands

- `npm test` — runs `node --test test/rotate.test.js` from the project root.

## Relevant Existing Behavior

- Defaults: `maxBytes` 1048576 (1 MiB), `keep` 5; caller options override
  them per call.
- `shouldRotate` returns false for a missing file and true when the file size
  is at least `maxBytes`. It does not validate `keep`.
- `rotate` throws `RangeError` unless `keep` is a positive integer, returns
  false for a missing file, deletes `<file>.<keep>` if present, renames
  `<file>.n` to `<file>.n+1` from `keep - 1` down to 1, renames the log to
  `<file>.1`, and returns true. It does not recreate the log.
- `rotateIfNeeded` calls `rotate` only when `shouldRotate` is true and
  otherwise returns false.

## Testing and Verification Baseline

- 4 tests in `test/rotate.test.js`; all pass with `npm test`.

## Evidence

- `src/rotate.js`, `test/rotate.test.js` — behavior above.
- `npm test` in the project root — exit 0, 4 passed.
