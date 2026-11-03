# records-api

Small records service used by the operations team. Handlers are plain
functions that take a request object and return `{ status, headers, body }`;
the HTTP server and session layer live in the deployment repository.

## Development

Node.js 22, no dependencies.

    npm test
