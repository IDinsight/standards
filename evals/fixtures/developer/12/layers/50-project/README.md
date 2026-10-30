# pantry

A small command-line stock tracker for a shared kitchen or storeroom.

```
pantry add <sku> <name> [quantity]
pantry adjust <sku> <delta>
pantry reorder-level <sku> <level>
pantry list
```

Data is kept in `pantry.json` in the current folder, or in the file named by
`PANTRY_FILE`.

Run the tests with `npm test`.
