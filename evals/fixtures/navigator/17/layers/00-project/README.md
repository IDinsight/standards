# relay

Delivers application events to customer webhook endpoints.

```js
import { deliver } from './src/deliver.js';

const result = await deliver(
  { type: 'invoice.paid', data: { id: 41 } },
  { url: 'https://example.test/hooks' },
  { send: fetch },
);
```

`deliver` posts the event as JSON and resolves to `{ delivered, status }`, or
`{ delivered: false, error }` when the request cannot be sent.

Run the tests with `node --test test/deliver.test.js`.
