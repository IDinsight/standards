import json
import socket
import urllib.error
import urllib.request

import config


class ProviderTimeout(Exception):
    """The rates provider did not respond within the configured timeout."""


def fetch_rates(base=config.DEFAULT_BASE_CURRENCY, opener=urllib.request.urlopen):
    """Return the provider's rates for base as a dict of currency code to rate."""
    url = f"{config.PROVIDER_URL}?base={base}"
    try:
        with opener(url, timeout=config.REQUEST_TIMEOUT_SECONDS) as response:
            payload = json.load(response)
    except (TimeoutError, socket.timeout) as exc:
        raise ProviderTimeout(url) from exc
    except urllib.error.URLError as exc:
        if isinstance(exc.reason, (TimeoutError, socket.timeout)):
            raise ProviderTimeout(url) from exc
        raise
    return payload["rates"]
