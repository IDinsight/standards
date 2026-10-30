# shelf

Small inventory service for the stockroom.

## Configuration

Settings come from built-in defaults, overridden by `SHELF_*` environment
variables (for example `SHELF_PORT=9000`).

## Development

    python3 -m pytest
    python3 -m shelf.show_config   # print the effective settings
