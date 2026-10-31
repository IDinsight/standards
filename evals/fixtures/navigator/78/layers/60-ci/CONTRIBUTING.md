# Contributing

- Branch from `main` and open a pull request.
- `main` is protected: the `test` and `image` jobs of the CI workflow are
  required status checks, and a pull request needs one approving review before
  it can merge.
- Keep routers thin. HTTP concerns go in `api/app/routers`, rules in
  `api/app/services`, and SQL in `api/app/persistence`.
- Every schema change is a new numbered file in `api/migrations/`.
- Run `ruff check .`, `mypy`, and `pytest` in `api/` before pushing.
