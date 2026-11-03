"""Request and response types and the router."""
from __future__ import annotations

import json
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

from records.auth import User
from records.errors import HttpError


@dataclass
class Request:
    method: str
    path: str
    query: dict[str, str] = field(default_factory=dict)
    user: User | None = None


@dataclass
class Response:
    status: int
    headers: dict[str, str]
    body: str


def json_response(status: int, data: Any) -> Response:
    """Return ``data`` serialized as a JSON response."""
    return Response(status, {"content-type": "application/json; charset=utf-8"}, json.dumps(data))


Handler = Callable[[Request], Response]


class Router:
    """Dispatches requests by exact path and method."""

    def __init__(self) -> None:
        self._routes: list[tuple[str, str, Handler]] = []

    def get(self, path: str, handler: Handler) -> None:
        self._routes.append(("GET", path, handler))

    def post(self, path: str, handler: Handler) -> None:
        self._routes.append(("POST", path, handler))

    def handle(self, request: Request) -> Response:
        """Run the matching handler.

        Unknown paths get 404 and known paths with another method get 405. An
        HttpError becomes a JSON error with its status; any other exception
        becomes 500.
        """
        for method, path, handler in self._routes:
            if path == request.path and method == request.method:
                try:
                    return handler(request)
                except HttpError as error:
                    return json_response(error.status, {"error": error.message})
                except Exception:
                    return json_response(500, {"error": "internal error"})
        if any(path == request.path for _, path, _ in self._routes):
            return json_response(405, {"error": "method not allowed"})
        return json_response(404, {"error": "not found"})
