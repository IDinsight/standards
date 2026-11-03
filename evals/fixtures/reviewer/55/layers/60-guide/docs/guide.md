# Byte helpers guide

This guide is for developers who call the byte-size helpers in
[`src/bytes.js`](../src/bytes.js) from their own modules. For setup and test
commands, see the [README](../README.md).

## Import

```js
import { formatBytes, parseBytes } from './src/bytes.js';
```

Adjust the path to where `src/bytes.js` sits relative to your module.

## Formatting sizes

`formatBytes(bytes, options)` turns a byte count into a short label. Counts too
small for the next unit are shown as whole bytes.

```js
formatBytes(512);      // '512 B'
formatBytes(1500000);  // '1.5 MB'
```

Labels use one decimal place by default. Pass `{ digits }` to change that, for
example `formatBytes(n, { digits: 2 })`.

## Parsing sizes

`parseBytes(text)` reads a label and returns the number of bytes, rounded to a
whole number. The unit is optional and case-insensitive; a bare number is read
as bytes.

```js
parseBytes('2 KiB');   // 2048
parseBytes('10');      // 10
```

## Errors

- `formatBytes` throws a `RangeError` when `bytes` is negative or not a finite
  number.
- `parseBytes` throws a `SyntaxError` when the text is not a number with an
  optional unit, or when the unit is not recognised.

More cases are covered in [`test/bytes.test.js`](../test/bytes.test.js).
