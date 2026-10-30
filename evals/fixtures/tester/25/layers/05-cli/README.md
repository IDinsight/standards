# records-tools

Clients of the records service, which lives in its own repository.

- `packages/web`: the records page of the admin tool (plain ES modules, no
  build step).
- `packages/export-cli`: `export-cli`, which turns a records dump into CSV.

## Development

Requires Node 22 with pnpm, and Python 3.10 or later with pytest.

    pnpm install
    pnpm --filter @records/web test

    cd packages/export-cli
    python3 -m pytest
