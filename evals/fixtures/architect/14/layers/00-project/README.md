# rates-client

Small exchange-rate client with an in-memory cache. You supply the function
that talks to your rate provider; the client caches the results per currency
pair.

## Usage

```js
import { RatesClient } from 'rates-client';

const client = new RatesClient({
  fetchRate: async (base, quote) => provider.lookup(base, quote),
});

const rate = await client.getRate('usd', 'eur');
```

## Configuration

- `fetchRate(base, quote)`: required async function that returns the rate from
  your provider. Currency codes are passed in upper case.
- `ttlSeconds`: cache lifetime in seconds (default 300).
- `maxEntries`: maximum number of cached pairs before old entries are pruned
  (default 500).

## Development

Run the tests with `npm test`.
