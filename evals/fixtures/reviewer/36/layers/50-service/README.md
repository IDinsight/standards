# records-admin

Backend for the internal records admin tool. Each customer organization is a
tenant; users sign in to one tenant and see only that tenant's records.

## Development

Requires Node 22 and pnpm.

    pnpm test

TypeScript runs through Node's type stripping; there is no build step and no
dependencies to install.
