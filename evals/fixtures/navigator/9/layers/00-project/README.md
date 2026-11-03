# envfile

Read dotenv-style configuration files into a plain object.

```js
import { load } from 'envfile';

const env = load('.env');
```

## Format

- One `KEY=value` per line. Keys use letters, digits, and underscores and do
  not start with a digit.
- Blank lines and lines starting with `#` are ignored.
- An optional `export ` prefix is accepted.
- A `#` preceded by whitespace starts an inline comment.
- A later key overrides an earlier one.

Malformed lines raise `ParseError`, whose `line` property is the 1-based line
number.

## Tests

`npm test`
