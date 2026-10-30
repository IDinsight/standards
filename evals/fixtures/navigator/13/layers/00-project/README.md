# invoice-totals

Small command-line tool that reads an invoice as JSON and prints its subtotal,
discount, tax, and total.

```sh
node src/cli.js examples/sample.json
```

Invoice format:

```json
{
  "currency": "USD",
  "discountCents": 500,
  "taxBasisPoints": 825,
  "lines": [{ "sku": "A-100", "quantity": 2, "unitCents": 1250 }]
}
```

Run the tests with `npm test`.
