# Vendored FastAPI subset

The build and deploy hosts for this service have no access to a package
index, so the parts of FastAPI the service uses are kept here instead of
installed: `FastAPI`, `APIRouter`, `Depends`, `HTTPException`,
`app.dependency_overrides`, and `fastapi.testclient.TestClient`. Code imports
them as `fastapi`, exactly as it would the upstream package; pytest finds them
through `pythonpath` in `pyproject.toml`.

Not included: request and response models, query parameters, middleware,
exception handlers, and an ASGI server. Keep application code within this
subset, or move to the upstream package once the hosts can install it.
