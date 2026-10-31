from syncer.retry import TransientError, retry

RETRYABLE_STATUSES = (502, 503, 504)


class PermanentError(Exception):
    """A response that will not change if the request is repeated."""


def get_json(transport, path, **retry_options):
    """Fetch path through transport, retrying gateway and availability errors."""

    def once():
        status, body = transport(path)
        if status in RETRYABLE_STATUSES:
            raise TransientError(f"{path}: HTTP {status}")
        if status >= 400:
            raise PermanentError(f"{path}: HTTP {status}")
        return body

    return retry(once, attempts=5, **retry_options)
