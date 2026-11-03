# timesheet

Summarizes time entries (`{ date: 'YYYY-MM-DD', minutes }`) into totals and
per-day figures.

```js
import { summarize } from './src/summary.js';
import { formatMinutes } from './src/format.js';

const { totalMinutes, byDay } = summarize(entries);
console.log(formatMinutes(totalMinutes));
```

Run the tests with `npm test` (or `node --test test/summary.test.js`).
