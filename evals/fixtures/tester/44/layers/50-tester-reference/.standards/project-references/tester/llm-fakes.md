# LLM client fakes

Read when tests touch code that calls the LLM client.

Tests never call the provider. Use `FakeLLMClient` from `tests/fakes.py`: it
has the same `summarize(text, max_words=80)` method as
`app.llm.client.LLMClient`, returns the `summary` you give it, raises the
`error` you give it, and records each call in `calls`.

Inject it through the app's dependency overrides, the same way
`tests/conftest.py` replaces the note store:

```python
import pytest

from app.llm.client import get_llm_client
from app.main import app
from tests.fakes import FakeLLMClient


@pytest.fixture
def fake_llm():
    fake = FakeLLMClient()
    app.dependency_overrides[get_llm_client] = lambda: fake
    yield fake
    app.dependency_overrides.pop(get_llm_client, None)
```

- `tests/conftest.py` sets `LLM_API_KEY` to a placeholder before the app is
  imported. Keep it that way; never put a real key in tests or test config.
- Assert status codes and response bodies, never model wording.
- To simulate a failure, construct the error and assign it to `fake.error`.
  `LLMRateLimitError` takes an optional `retry_after`.

## Error coverage

The client can raise nine error types, all subclasses of `LLMError` in
`app/llm/client.py` (listed in `ERROR_TYPES`):

- `LLMTimeoutError`
- `LLMConnectionError`
- `LLMRateLimitError`
- `LLMAuthError`
- `LLMBadRequestError`
- `LLMServerError`
- `LLMMalformedResponseError`
- `LLMTruncatedError`
- `LLMRefusalError`

Every route that calls the model must have a test for each of these nine error
types, in addition to its success test.
