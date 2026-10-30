# notify

Hands outgoing messages to a transport you supply.

```js
import { sendMessage } from './src/send.js';

await sendMessage(transport, { to: 'ada@example.org', subject: 'Hello', body: 'Hi Ada' });
```

`transport.send(message)` must resolve to an object with a numeric `status`.
Run the tests with `npm test`.
