# records-service

In-memory record store used by the operations dashboard.

## Usage

```js
import { createStore } from './src/store.js';

const store = createStore();
store.add({ name: 'Ada', email: 'ada@example.org' });
store.list();
```

## Tests

`npm test`
