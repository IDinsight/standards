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

## Tests

```sh
npm test
```
