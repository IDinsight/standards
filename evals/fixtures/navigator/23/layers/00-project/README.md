# jsonclient

Small JSON-over-HTTP client used by our internal tools. Requests that fail
with a server error (5xx) or a network error marked retryable are retried
with exponential backoff; see `src/retry.js`.

```js
import { createClient } from './src/client.js';

const client = createClient({ baseUrl: 'https://inventory.internal/' });
const items = await client.getJson('items');
```

Run the tests with `npm test`.
