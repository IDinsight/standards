# contacts

In-memory contact directory used by the support tools. Plain JavaScript ES
modules, no dependencies.

```js
import { createDirectory, formatContact } from './src/index.js';

const directory = createDirectory([{ id: 1, name: 'Ada Lovelace', email: 'ada@example.org' }]);
console.log(formatContact(directory.get(1)));
```

Records are `{ id, name, email }`. Ids must be unique; email addresses are
stored in lowercase.

## Tests

`npm test` (or `pnpm test`) runs the test files listed in `package.json`.
`node --test test/<file>.test.js` runs a single file. Shared JSON fixtures live
in `test/fixtures/` and are loaded with `loadFixture` from `test/helpers.js`.
