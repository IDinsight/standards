# Configuration

ledgerline reads its settings from `ledgerline.json` in the current directory.
Pass `--config <path>` to read another file. Every setting is optional; when
there is no `ledgerline.json`, all defaults apply.

```json
{
  "currency": "EUR",
  "dateFormat": "DD/MM/YYYY"
}
```

## currency

The three-letter currency code printed after each total, for example `EUR`.
Default: `USD`.

## dateFormat

How dates are written in the ledger file. Allowed values: `YYYY-MM-DD` or
`DD/MM/YYYY`. Default: `YYYY-MM-DD`.

:::note
A row whose date does not match `dateFormat` stops the run with the line number
of the row.
:::

## skipEmptyRows

Whether blank lines in the ledger file are ignored. Default: `true`.

:::note
With `skipEmptyRows` set to `false`, a blank line stops the run with an error
naming its line.
:::
