# durfmt

Parse and format short human-readable durations such as `1h30m`, `2d 4h`,
or `45s`.

## Install

```sh
pip install .
```

## Library

```python
from durfmt import parse, format_duration

parse("1h30m")                       # 5400
parse("2d 4h")                       # 187200
format_duration(5400)                # "1h30m"
format_duration(90000, largest="h")  # "25h"
```

Rules for `parse`:

- Units are `d`, `h`, `m`, and `s`. Each may appear at most once, in that
  order.
- Spaces are ignored and letters are case-insensitive.
- A bare number is read as seconds.
- Anything else raises `DurationError`, a subclass of `ValueError`.

Rules for `format_duration`:

- Units with a zero amount are left out; zero itself is `0s`.
- `largest` caps the biggest unit used (default `d`).
- Negative values raise `ValueError`.

## Command line

```sh
$ durfmt 1h30m
5400
$ durfmt 90000 --largest h
25h
```

A duration is converted to seconds; a bare number of seconds is converted to a
duration. An invalid duration prints an error and exits with status 2.

## Development

```sh
python -m pytest
```
