# records-service

In-memory record store used by the operations dashboard.

## Usage

```js
import { createStore } from './src/store.js';

const store = createStore();
store.add({ name: 'Ada', email: 'ada@example.org' });
store.list();
```

## CSV export

`toCsv(rows, columns)` in `src/export.js` returns RFC 4180 CSV text: a header
row with the column names, then one line per record, each line ending in CRLF.
Columns default to the keys of the first row. Fields that contain commas,
double quotes, or line breaks are wrapped in double quotes, and embedded quotes
are doubled. Missing values become empty cells.

```js
import { toCsv } from './src/export.js';

const csv = toCsv(store.list(), ['id', 'name', 'email']);
```

## Tests

`npm test`
