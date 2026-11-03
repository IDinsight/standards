# quote-sync

Fetches the latest prices for the configured symbols from the internal quotes
service.

    npm run sync
    npm test

## Configuration

`config/default.json`:

- `upstream.baseUrl`: base URL of the quotes service.
- `upstream.timeoutSeconds`: seconds each quote request may take before it is
  abandoned. Symbols that time out are listed on stderr and the run continues.
- `symbols`: symbols to fetch, in order.
