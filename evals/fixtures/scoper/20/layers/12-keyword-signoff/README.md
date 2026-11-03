# catalog-search

Search helpers for the publications catalog.

```js
import { search } from './src/search.js';
import { sampleRecords } from './src/catalog.js';

search(sampleRecords, 'soil');
```

`search(records, query)` matches the query against titles and summaries,
ignoring case, lists title matches before summary-only matches, and throws
`SearchError` for an empty query.

Product scope: [docs/product/search.md](docs/product/search.md).

Run the tests with `npm test`.
