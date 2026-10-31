# contact-sync

Pulls changed contacts from the CRM API in pages.

`get_json` retries gateway and availability errors (502, 503, 504) with
exponential backoff and jitter; see `syncer/retry.py`. Other 4xx/5xx responses
raise `PermanentError` at once.

Run the tests with `python -m pytest`.
