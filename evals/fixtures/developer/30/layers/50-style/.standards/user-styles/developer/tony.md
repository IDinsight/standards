# Tony's development style

- Give every Python module I touch an explicit `__all__` listing its public
  names.
- Prefer `typing.NamedTuple` over `dataclasses` for small immutable records.
- Use single quotes for string literals unless the string contains one.
- Start every public function with a one-line docstring in the imperative mood.
- Keep functions under 20 lines; pull out a helper before they grow past that.
