# reportdesk

Internal reporting service. Every report belongs to a team; members of that
team and admins can read it. Requests go through `handle()` in
`src/routes.js`, which returns `{ status, body }`; `src/server.js` adapts it
to `node:http`.

## Development

Node 22, no dependencies.

    npm test
