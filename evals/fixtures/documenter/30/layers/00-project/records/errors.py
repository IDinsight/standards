"""Errors that route handlers raise to produce an HTTP error response."""


class HttpError(Exception):
    """Turned by the router into a JSON response ``{"error": message}`` with ``status``."""

    def __init__(self, status: int, message: str) -> None:
        super().__init__(message)
        self.status = status
        self.message = message
