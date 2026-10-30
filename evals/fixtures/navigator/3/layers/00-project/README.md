# fetchlite

Small HTTP fetch helper built on the standard library.

## Usage

```python
from fetchlite import fetch

body = fetch("https://example.org/data.json", timeout=5)
```

## Configuration

`fetch(url, timeout=10)`: `timeout` is how many seconds to wait for the server
at each step (connecting, then each read of the response) before giving up
with `FetchTimeout`. It limits each wait, not the total download time.

## Development

Run the tests with `python3 -m pytest`.
