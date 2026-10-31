# hookrelay

Delivers webhook events to a configured endpoint and retries failed
deliveries with exponential backoff. Callers supply the transport.

See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, configuration, and
retry behavior.

## Tests

    npm test
