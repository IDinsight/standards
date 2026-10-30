# Priya's development style

- Prefer explicit `for` loops over comprehensions when the body has more than
  one condition.
- Use Google-style docstrings with `Args:` and `Returns:` sections on every
  function, public or not.
- Group related helpers into a class rather than module-level functions.
- Leave type hints off internal helpers; add them only at module boundaries.
