# shelf

Small inventory service for the stockroom.

## Configuration

Settings are resolved in this order, later sources winning:

1. built-in defaults (`shelf/config.py`)
2. `shelf.ini` in the working directory, `[server]` section
3. `SHELF_*` environment variables, for example `SHELF_PORT=9000`

The committed `shelf.ini` holds the local development settings.

## Development

    python3 -m pytest
    python3 -m shelf.show_config   # print the effective settings
