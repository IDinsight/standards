# Tony: documentation

- Python docstrings use the NumPy format: a one-line summary, a short
  description when it helps, then `Parameters`, `Returns`, and `Raises`
  sections as they apply.
- Every public function docstring ends with an `Examples` section showing one
  simple happy-path usage example. One example only; edge cases belong in the
  guide or the tests.
- Plain words over jargon. Say what the caller gets back.
