# records-admin

Records service for the internal records admin tool: an in-memory record
store loaded from seed data, role checks, and the route handlers the admin
tool serves under `/api`. The admin tool (a separate repository) runs the HTTP
server and attaches the signed-in user to each request; this repository has
no HTTP listener. See [docs/usage.md](docs/usage.md) for the API.

## Development

Requires Node 22. There are no dependencies to install.

    npm test
    npm run docs:build

`npm run docs:build` renders `docs/*.md` into `build/docs/` and fails on
broken links or unclosed code blocks.
