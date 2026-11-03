# quotes

Shipping quote service for checkout. `POST /quotes` takes an origin, a
destination, and a parcel weight, asks the CarrierLink rates API for prices, and
returns the quotes cheapest first.

## Layout

- `src/server.js` - HTTP entry point (`POST /quotes`, `GET /health`)
- `src/quotes.js` - request validation and error mapping
- `src/rates-client.js` - CarrierLink client with a per-attempt timeout and retries
- `src/breaker.js` - circuit breaker around the rates call
- `src/config.js` - loads `config/<APP_ENV>.json`
- `deploy/nginx.conf` - production reverse proxy

## Commands

- `npm test` - unit tests (no network)
- `APP_ENV=production npm start` - run the service
