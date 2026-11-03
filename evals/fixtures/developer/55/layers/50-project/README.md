# bookmarks

A small in-memory bookmark library: create a store, add bookmarks with tags,
list them, and render them as text.

```js
import { addBookmark, createStore, listBookmarks } from './src/bookmarks.js';
import { formatList } from './src/format.js';

const store = createStore();
addBookmark(store, { url: 'https://nodejs.org', title: 'Node.js', tags: ['dev'] });
console.log(formatList(listBookmarks(store)));
```

Run the tests with `npm test`.
