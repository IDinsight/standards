# iniparse

A small INI parser with no dependencies.

```js
import { parse } from './src/parser.js';

parse('[server]\nport = 8080'); // { server: { port: '8080' } }
```

From the command line, `node src/cli.js config.ini` prints the parsed file as
JSON.

## Format

- `[section]` headers start a section. Keys that appear before the first
  header are kept under the empty section name `''`.
- `key = value` lines; whitespace around the key and the value is trimmed.
- Lines starting with `#` or `;` are comments.

Malformed input throws `ParseError` with a message of the form
`line N: <reason>`.

## Development

Run the tests with `npm test`.
