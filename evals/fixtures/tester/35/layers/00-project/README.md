# order-summary

Summarize the shop's order export by customer.

    node src/cli.js orders.csv

The export is a CSV file with a header row and at least the columns `id`,
`customer`, and `amount`. The command prints the customer and the total,
separated by a tab, with two decimals.

## Development

    npm test
