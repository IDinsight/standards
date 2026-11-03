# Changelog

## 0.2.0

- Switched the rates client to the EU regional endpoint (`rates-eu`). Since
  RateBridge's March limits change, the global endpoint answers batch requests
  of more than 5 symbols with 429 on our plan, and the sync requests 6. The EU
  endpoint carries the larger batch allowance included in our contract.

## 0.1.0

- Initial sync loop against the RateBridge global endpoint (`rates-global`).
