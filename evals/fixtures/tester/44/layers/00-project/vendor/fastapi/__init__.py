"""Subset of the FastAPI interface used by this service.

See VENDORED.md for why this lives in the repository.
"""

import asyncio
import inspect
import re

__all__ = ["APIRouter", "Depends", "FastAPI", "HTTPException"]


class HTTPException(Exception):
    def __init__(self, status_code, detail=None, headers=None):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail
        self.headers = dict(headers or {})


class RequestValidationError(Exception):
    def __init__(self, errors):
        super().__init__(errors)
        self.errors = errors


class _Depends:
    def __init__(self, dependency):
        self.dependency = dependency


def Depends(dependency):
    return _Depends(dependency)


class _Route:
    def __init__(self, method, path, endpoint, status_code):
        self.method = method
        self.path = path
        self.endpoint = endpoint
        self.status_code = status_code
        pattern = re.sub(r"\{(\w+)\}", r"(?P<\1>[^/]+)", path)
        self.regex = re.compile(f"^{pattern}$")


class APIRouter:
    def __init__(self, prefix="", tags=None):
        self.prefix = prefix
        self.tags = list(tags or [])
        self.routes = []

    def add_api_route(self, path, endpoint, methods, status_code=200):
        for method in methods:
            self.routes.append(_Route(method.upper(), self.prefix + path, endpoint, status_code))

    def api_route(self, path, methods, status_code=200, **_options):
        def register(endpoint):
            self.add_api_route(path, endpoint, methods, status_code)
            return endpoint

        return register

    def get(self, path, **options):
        return self.api_route(path, ["GET"], **options)

    def post(self, path, **options):
        return self.api_route(path, ["POST"], **options)

    def put(self, path, **options):
        return self.api_route(path, ["PUT"], **options)

    def patch(self, path, **options):
        return self.api_route(path, ["PATCH"], **options)

    def delete(self, path, **options):
        return self.api_route(path, ["DELETE"], **options)

    def include_router(self, router, prefix=""):
        for route in router.routes:
            self.routes.append(
                _Route(route.method, self.prefix + prefix + route.path, route.endpoint, route.status_code)
            )


def _run(value):
    return asyncio.run(value) if inspect.iscoroutine(value) else value


def _convert(name, value, annotation):
    if annotation in (int, "int"):
        try:
            return int(value)
        except ValueError:
            raise RequestValidationError(
                [{"loc": ["path", name], "msg": "Input should be a valid integer", "type": "int_parsing"}]
            ) from None
    return value


class FastAPI(APIRouter):
    def __init__(self, title="FastAPI", version="0.1.0", **_options):
        super().__init__()
        self.title = title
        self.version = version
        self.dependency_overrides = {}

    def handle(self, method, path, body=None):
        """Dispatch one request and return (status, payload, headers)."""
        method_mismatch = False
        for route in self.routes:
            match = route.regex.match(path)
            if match is None:
                continue
            if route.method != method:
                method_mismatch = True
                continue
            try:
                arguments = self._arguments(route.endpoint, match.groupdict(), body, {})
                payload = _run(route.endpoint(**arguments))
            except HTTPException as exc:
                return exc.status_code, {"detail": exc.detail}, exc.headers
            except RequestValidationError as exc:
                return 422, {"detail": exc.errors}, {}
            return route.status_code, payload, {}
        if method_mismatch:
            return 405, {"detail": "Method Not Allowed"}, {}
        return 404, {"detail": "Not Found"}, {}

    def _arguments(self, function, path_params, body, cache):
        arguments = {}
        for name, parameter in inspect.signature(function).parameters.items():
            if parameter.kind in (parameter.VAR_POSITIONAL, parameter.VAR_KEYWORD):
                continue
            if isinstance(parameter.default, _Depends):
                arguments[name] = self._solve(parameter.default.dependency, path_params, body, cache)
            elif name in path_params:
                arguments[name] = _convert(name, path_params[name], parameter.annotation)
            elif parameter.default is not inspect.Parameter.empty:
                continue
            elif body is None:
                raise RequestValidationError([{"loc": ["body"], "msg": "Field required", "type": "missing"}])
            else:
                arguments[name] = body
        return arguments

    def _solve(self, dependency, path_params, body, cache):
        if dependency not in cache:
            provider = self.dependency_overrides.get(dependency, dependency)
            cache[dependency] = _run(provider(**self._arguments(provider, path_params, body, cache)))
        return cache[dependency]
