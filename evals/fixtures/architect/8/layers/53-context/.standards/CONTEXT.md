# Project Context

## Project Baseline

- `ledgerctl` 0.4.0 is a small command-line client for the Ledger reporting
  API with `whoami`, `balances`, and `config` commands.
- Before this cycle, every authenticated command takes its API token from
  `--token` or `LEDGERCTL_TOKEN`; nothing is stored between runs.

## Stack and Tooling

- Python >= 3.11, standard library only (`dependencies = []` in
  `pyproject.toml`): `urllib` for HTTP, `argparse` for the CLI, `json` for
  local files.
- pytest for tests (`pythonpath` set in `pyproject.toml`).

## Structure and Boundaries

- `ledgerctl/cli.py` — argument parsing, token resolution (`resolve_token`),
  command dispatch; `main()` takes `client_factory` and `out` for tests.
- `ledgerctl/client.py` — `LedgerClient`, bearer-token HTTP calls; raises
  `ApiError` for HTTP and connection errors.
- `ledgerctl/config.py` — config directory resolution and `config.json`
  load/save (`load_stored`, `load_config`, `save_config`).
- `tests/` — pytest suites; `tests/conftest.py` points `LEDGERCTL_CONFIG_DIR`
  at a temporary directory and clears `LEDGERCTL_TOKEN` for every test.

## Commands

- `python3 -m pytest -q` — run all tests from the project root.
- `python3 -m ledgerctl <command>` — run the CLI.

## Conventions and Constraints

- No third-party dependencies.
- All local state lives in the config directory: `LEDGERCTL_CONFIG_DIR`, else
  `$XDG_CONFIG_HOME/ledgerctl`, else `~/.config/ledgerctl`.
- `config.json` is JSON written by `save_config` through a temporary file from
  `tempfile.mkstemp` in the same directory, then `os.replace`; the resulting
  file keeps the temporary file's mode, `0600`. Keys read from the file are
  preserved on save; `DEFAULTS` fill missing keys on load.
- `--token` wins over `LEDGERCTL_TOKEN`. With no token, commands print
  `not authenticated: pass --token or set LEDGERCTL_TOKEN` to stderr and exit
  with status 2. API errors print `error: <message>` to stderr, exit status 1.

## External Systems and Data

- Ledger reporting API at `base_url` (default
  `https://api.ledger.example.com`): `GET /v1/me`, `GET /v1/balances`, bearer
  token. It is not reachable from the development environment; tests use fake
  clients and openers.

## Testing and Verification Baseline

- 12 tests in `tests/test_cli.py`, `tests/test_client.py`, and
  `tests/test_config.py`; all pass on the current tree. No tests cover `login`
  or stored tokens.

## Active-Cycle Non-Baseline Work

- `Cycle: credential-persistence-20260925T090000Z-2b3c4d5e; ledgerctl/credstore.py`
  — added by the earlier expedited attempt in commit
  `${COMMIT:Add login command with local credential store}`. It stores tokens
  in a SQLite database, `credentials.sqlite3`, in the config directory, keyed
  by base URL. Tentative active-cycle implementation, not established baseline.
- `Cycle: credential-persistence-20260925T090000Z-2b3c4d5e; ledgerctl/cli.py`
  — the `login` subcommand and the stored-token fallback in `resolve_token`
  come from the same commit. Tentative; the pre-cycle `resolve_token` read only
  `--token` and `LEDGERCTL_TOKEN`.

## Evidence

- `git show --stat ${COMMIT:Initial ledgerctl CLI}` — pre-cycle baseline.
- `git show ${COMMIT:Add login command with local credential store}` — the
  expedited attempt.
- `python3 -m pytest -q` — 12 passed on the current tree.
