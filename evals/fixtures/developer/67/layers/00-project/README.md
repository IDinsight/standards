# reading-list

A small in-memory reading list used by the book club site.

```js
import { createReadingList } from './src/readingList.js';

const list = createReadingList();
list.add({ title: 'Middlemarch', author: 'George Eliot', tags: ['Classics'] });
list.list();
```

Run the tests with `npm test`.
