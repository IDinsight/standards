# pricing-sync

Pulls the latest FX rates from RateBridge on a fixed interval so the billing
service can price invoices in local currency.

## Layout

- `src/index.js`: entry point; loads config and runs the sync loop.
- `src/config.js`: reads `config/service.json` and applies environment overrides.
- `src/endpoints.js`: named RateBridge endpoints and their base URLs.
- `src/rates-client.js`: HTTP client for the rates API.

## Configuration

`config/service.json` names the RateBridge endpoint to use and holds the API
token. `RATES_ENDPOINT` and `RATES_API_TOKEN` override them at runtime.

## Commands

- `npm test`: unit tests (no network).
- `npm start`: run the sync loop against the configured endpoint.
