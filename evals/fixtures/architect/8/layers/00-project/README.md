# ledgerctl

Command-line client for the Ledger reporting API.

## Usage

    python3 -m ledgerctl --token <token> whoami
    python3 -m ledgerctl --token <token> balances --format json

Every API command needs a token, from `--token` or the `LEDGERCTL_TOKEN`
environment variable. `--token` wins when both are set.

## Configuration

    python3 -m ledgerctl config base_url https://ledger.internal.example
    python3 -m ledgerctl config default_format

Settings live in `config.json` in `$LEDGERCTL_CONFIG_DIR`, or
`$XDG_CONFIG_HOME/ledgerctl`, or `~/.config/ledgerctl`.

## Development

    python3 -m pytest -q
