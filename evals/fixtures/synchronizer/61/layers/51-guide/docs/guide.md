# Log rotation guide

`src/rotate.js` keeps an application log from growing without bound by moving
it aside into numbered backups. This guide covers the two options and the
backup files you will see on disk.

## Options

Pass options as the second argument to `shouldRotate`, `rotate`, or
`rotateIfNeeded`. Anything you leave out uses the default.

| Option     | Default           | Meaning                                                          |
| ---------- | ----------------- | ---------------------------------------------------------------- |
| `maxBytes` | `1048576` (1 MiB) | Rotate once the log is at least this many bytes.                 |
| `keep`     | `5`               | Number of numbered backups to keep. Must be a positive integer.  |

```js
import { rotateIfNeeded } from './src/rotate.js';

rotateIfNeeded('logs/app.log', { maxBytes: 5 * 1024 * 1024, keep: 3 });
```

## Backup files

Each rotation renames `app.log` to `app.log.1`. Existing backups move up one
number first: `app.log.1` becomes `app.log.2`, and so on. `app.log.1` is always
the most recent backup and `app.log.<keep>` the oldest. When `app.log.<keep>`
already exists, it is deleted before the others move up.

The current log is not recreated; the next write to `app.log` creates it.
