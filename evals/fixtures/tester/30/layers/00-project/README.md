# contacts

A small in-memory contacts directory for Node.js.

```js
import { Directory } from './src/directory.js';

const directory = new Directory()
  .add({ id: 'c1', name: 'Ada Lovelace', email: 'ada@example.org' });
directory.list();
```

`loadDirectory(path)` reads a JSON array of contacts from a file.

Run the tests with `npm test`.
