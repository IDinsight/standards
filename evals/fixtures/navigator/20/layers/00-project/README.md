# syncer

Small client for pulling change batches from the sync service.

- `syncer/client.py` — `SyncClient`, which pulls changes since a cursor.
- `syncer/retry.py` — retry helper with exponential backoff used by the client.

Run the tests with `python3 -m pytest`.
