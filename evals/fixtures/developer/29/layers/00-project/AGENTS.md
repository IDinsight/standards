# parcels: notes for contributors

- Python 3.11, standard library only; no third-party runtime dependencies.
- Run the tests from the repository root with `python3 -m pytest`.
- Code is formatted with black (`line-length = 100` in `pyproject.toml`), so strings use double quotes.
- Amounts of money are `decimal.Decimal`; never convert them to `float`.
