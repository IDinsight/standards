# notes

A small in-memory notes library with a plain-text export.

```js
import { createStore, createNote, listNotes } from './src/notes.js';
import { formatNotes } from './src/format.js';

const store = createStore();
createNote(store, { title: 'Groceries', body: 'Milk, eggs' });
console.log(formatNotes(listNotes(store)));
```

Run the tests with `npm test`.
