# ledgerline

Totals a CSV ledger by account.

## Usage

```sh
node src/cli.js ledger.csv
node src/cli.js --config other.json ledger.csv
```

Settings are read from `ledgerline.json` in the current directory when it
exists. See the [configuration guide](docs/configuration.md).

## Development

```sh
npm test
```

## Documentation

The user guide lives in `docs/`. Build the site with `npm run docs:build`;
pages are written to `site/`.
