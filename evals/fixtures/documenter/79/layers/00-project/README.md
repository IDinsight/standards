# stockroom

Keep a small stock list in a JSON file and move it in and out as CSV.

## Requirements

Node.js 22 or later. There are no dependencies to install.

## Usage

```sh
node bin/stockroom.js export > stock.csv
node bin/stockroom.js import new-stock.csv
```

- `export` prints every item as CSV. See [docs/export.md](docs/export.md).
- `import` reads items from a CSV file into the stock list.

Both commands use `stockroom.json` in the current directory; pass
`--db <path>` to use another file.

## Development

```sh
npm test
```
