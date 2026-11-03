# notifier

Sends order events to a webhook endpoint.

- `src/webhooks/deliver.js` delivers one event through a `send` function.
- `src/config.js` holds the service settings.
- `src/app.js` wires delivery to the configured webhook URL.

Run the tests with `npm test`.
