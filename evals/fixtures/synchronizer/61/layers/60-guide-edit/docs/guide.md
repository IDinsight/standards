# Log rotation guide

`src/rotate.js` stops an application log from growing without bound. When the
log gets too big, it is renamed into a numbered backup and older backups shift
along. This guide explains when rotation happens, how to configure it, and what
you will find on disk afterwards.

## When rotation runs

Nothing rotates on its own. Your code calls one of three functions:

- `shouldRotate(file, options)` returns `true` when `file` exists and is at
  least `maxBytes` bytes, and `false` otherwise, including when the file does
  not exist yet.
- `rotate(file, options)` rotates unconditionally. It returns `false` and does
  nothing when `file` does not exist, and `true` after a rotation.
- `rotateIfNeeded(file, options)` rotates only when `shouldRotate` says so and
  returns whether it did.

## Configuring retention

Both options are optional; anything you leave out uses the default.

- `maxBytes` (default `1048576`, 1 MiB): the size at which the log is due for
  rotation. A log of exactly `maxBytes` bytes rotates.
- `keep` (default `5`): how many backups to keep. It must be a positive
  integer.

With `keep: 3`, rotation keeps `app.log.1` to `app.log.3`, newest first, and
deletes the backup that would otherwise become `app.log.4`.

## Backup files

A rotation works from the oldest backup down:

1. `app.log.<keep>` is deleted if it exists.
2. Every other backup moves up one number, starting with the highest:
   `app.log.2` becomes `app.log.3`, then `app.log.1` becomes `app.log.2`.
3. `app.log` becomes `app.log.1`.

The current log is not recreated. The next write to `app.log` creates a new,
empty file.

## Using rotation in a service

Check before each write rather than after:

```js
import { appendFileSync } from 'node:fs';
import { rotateIfNeeded } from './src/rotate.js';

export function writeLine(line) {
  rotateIfNeeded('logs/app.log', { maxBytes: 5 * 1024 * 1024, keep: 3 });
  appendFileSync('logs/app.log', line + '\n');
}
```

## Troubleshooting

- `RangeError: keep must be a positive integer`: `rotate` and
  `rotateIfNeeded` throw this when `keep` is `0`, negative, or not a whole
  number.
