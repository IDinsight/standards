# notifier

Posts short text messages to a webhook, retrying transient failures.

## Usage

```sh
python3 -m notifier.cli "Deploy finished" --config notifier.json
```

## Configuration

Settings come from three places, later ones winning:

1. Built-in defaults in `notifier/config.py`.
2. A JSON file, given with `--config` or the `NOTIFIER_CONFIG` environment
   variable. See `config.example.json`. Unknown keys are rejected.
3. Environment variables named `NOTIFIER_<KEY>`, for example
   `NOTIFIER_TIMEOUT=2.5`.

| Key            | Default                       |
|----------------|-------------------------------|
| `webhook_url`  | `http://localhost:8080/hooks` |
| `timeout`      | `5.0` seconds                 |
| `max_attempts` | `3`                           |
| `backoff`      | `0.5` seconds                 |

## Tests

```sh
python3 -m pytest
```
