# ledgerline

Totals a CSV ledger by account.

## Usage

```sh
node src/cli.js ledger.csv
node src/cli.js --config other.json ledger.csv
```

Settings are read from `ledgerline.json` in the current directory when it
exists.

## Development

```sh
npm test
```
