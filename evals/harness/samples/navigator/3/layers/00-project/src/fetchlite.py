import urllib.request


class FetchTimeout(Exception):
    """Raised when the server does not answer within the timeout."""


def fetch(url, timeout=10):
    """Return the response body of url.

    timeout: seconds to wait for the complete response before raising FetchTimeout.
    """
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            return response.read()
    except TimeoutError as exc:
        raise FetchTimeout(url) from exc
