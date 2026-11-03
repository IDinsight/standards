# expense-report

Summarizes household expense records exported as CSV (`date,category,amount`)
into a monthly report with per-category totals.

## Usage

```sh
node bin/report.js data/sample.csv 2026-08
```

Amounts are read as decimal strings with at most two fractional digits and are
handled internally as integer cents.

## Tests

```sh
npm test
```
