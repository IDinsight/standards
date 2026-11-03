import urllib.error
import urllib.request


class FetchTimeout(Exception):
    """Raised when the server is too slow to accept the connection or send data."""


def fetch(url, timeout=10):
    """Return the response body of url.

    timeout: seconds to wait for the server at each step (connecting, then
    each read of the response) before raising FetchTimeout. It limits each
    wait, not the total download time.
    """
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            return response.read()
    except TimeoutError as exc:
        raise FetchTimeout(url) from exc
    except urllib.error.URLError as exc:
        if isinstance(exc.reason, TimeoutError):
            raise FetchTimeout(url) from exc
        raise
