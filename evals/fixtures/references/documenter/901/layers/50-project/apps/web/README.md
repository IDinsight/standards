# datahub web

Browser client for the datahub API, built with Vite and TypeScript.

## Setup

```sh
pnpm install
```

## Run

```sh
pnpm dev
```

Set `VITE_API_URL` if the API is not at http://localhost:8000. The page asks
for an API token once per browser session.

## Test

```sh
pnpm test
```

## Pages

### Imports

Upload a CSV file; the page lists your finished imports from this session.
