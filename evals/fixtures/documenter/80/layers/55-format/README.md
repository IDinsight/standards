# durations

Parse human-readable durations into milliseconds, and format milliseconds
back into compact strings.

## Usage

```js
import { formatDuration, parseDuration } from './src/duration.js';

parseDuration('1m30s'); // 90000
parseDuration('500ms'); // 500
formatDuration(90000); // '1m30s'
formatDuration(0); // '0ms'
```

Supported units: `ms`, `s`, `m`, `h`, `d`. `parseDuration` throws a
`TypeError` for malformed input; `formatDuration` throws a `RangeError` for
negative or non-finite values and rounds to whole milliseconds.

## Tests

```sh
npm test
```
