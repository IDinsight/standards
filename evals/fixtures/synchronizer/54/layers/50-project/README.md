# records-export

CSV export helper for the records admin tools.

```js
import { toCsv } from './src/csv.js';

toCsv([{ id: '1', name: 'Ada' }]); // 'id,name\n1,Ada'
```

Columns come from the keys of the first row. Fields containing commas, double
quotes, or line breaks are quoted per RFC 4180.

Run the tests with `npm test`.
