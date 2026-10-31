# Using the rates CLI

`rates` prints the shipping price for one parcel.

## Getting a quote

Run the CLI from the project root with the parcel weight in kilograms and,
optionally, a zone:

    node bin/rates.js <weight-kg> [zone]

If you leave out the zone, `domestic` is used. The price is printed on one line
with two decimals and no currency symbol:

    $ node bin/rates.js 2 regional
    11.20

## Zones

| Zone            | Base  | Per kg |
| --------------- | ----- | ------ |
| `domestic`      | 4.50  | 1.20   |
| `regional`      | 7.00  | 2.10   |
| `international` | 15.00 | 4.75   |

## How weight is billed

Weight is rounded up to the next whole kilogram before pricing, so a 1.2 kg
parcel is billed as 2 kg. The price is the zone base plus the per-kg rate times
the billed weight, rounded to the nearest cent.

## Errors

- No weight given: the usage line is printed to stderr and the exit code is 2.
- Unknown zone: `unknown zone: <zone>` on stderr, exit code 1.
- Weight that is zero, negative, or not a number: `weight must be positive` on
  stderr, exit code 1.
