# invoice-cli

Prints subtotal, tax, and total for an order file.

```sh
bin/invoice.js order.json
```

An order file looks like:

```json
{ "taxRate": 0.0825, "items": [{ "sku": "MUG-01", "unitPriceCents": 1500, "quantity": 2 }] }
```

All amounts are integer cents. Run the tests with `npm test`.
