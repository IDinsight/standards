# durations

Parse human-readable durations into milliseconds.

## Usage

```js
import { parseDuration } from './src/duration.js';

parseDuration('1m30s'); // 90000
parseDuration('500ms'); // 500
```

Supported units: `ms`, `s`, `m`, `h`, `d`. Malformed input throws a
`TypeError`.

## Tests

```sh
npm test
```
