# contacts

A small in-memory contacts directory for Node.js.

```js
import { Directory } from './src/directory.js';

const directory = new Directory()
  .add({ id: 'c1', name: 'Ada Lovelace', email: 'ada@example.org' });
directory.list();
```

## Loading and saving

`loadDirectory(path)` reads a JSON array of contacts. It fails with an error
that starts with the file path when the JSON is not an array, and names the
row number when a row has no `id` or `name` or repeats an earlier `id`. Email
addresses are trimmed and lowercased when loaded.

`saveDirectory(directory, path)` writes the contacts, sorted by name, as a
JSON array that `loadDirectory` reads back. It writes a `.tmp` file next to the
target first and then renames it into place.

Run the tests with `npm test`.
