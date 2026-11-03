# records-api

Small in-memory JSON API over person records, used by the internal admin
tools. Request handlers are plain functions that return `{ status, body }`;
`src/server.js` wires them to `node:http`.

The API contract, including paging, is in [docs/api.md](docs/api.md).

## Running

```sh
npm start   # serves on PORT (default 3000)
npm test
```

No dependencies; Node.js 22 or later.
