# timer

Runs a named command on a fixed interval.

    timer backup --every 30s

## Durations

`--every` accepts a number followed by `s`, `m`, or `h`. A number without a
unit is read as minutes, so `--every 90` means every 90 minutes.

Run the tests with `python3 -m pytest`.
