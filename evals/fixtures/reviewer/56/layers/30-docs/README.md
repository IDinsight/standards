# archivekeep

Selects expired export archives for the nightly cleanup job.

## Usage

```js
import { loadConfig } from './src/config.js';
import { selectExpired } from './src/prune.js';

const config = loadConfig({ archiveDir: '/var/exports' });
const expired = selectExpired(entries, new Date(), config);
```

`entries` is a list of `{ name, createdAt }` objects; `selectExpired` returns
the names of the archives that should be removed.

## Configuration

`loadConfig(overrides)` merges `overrides` over the defaults and validates the
result. It throws when a value is invalid.

| Option          | Type           | Default      | Rules                                                 |
| --------------- | -------------- | ------------ | ----------------------------------------------------- |
| `archiveDir`    | string         | `./archives` | Must be a non-empty string (`TypeError` otherwise).   |
| `retentionDays` | integer (days) | `30`         | Must be a positive integer (`RangeError` otherwise).  |
| `compress`      | boolean        | `true`       | Any value is converted to `true` or `false`.          |

### Retention

Archives are kept for 30 days by default. `selectExpired` treats an archive as
expired once its `createdAt` is more than `retentionDays` × 24 hours before the
`now` you pass in. Set `retentionDays` to keep archives for a different period.

## Tests

```sh
npm test
```
