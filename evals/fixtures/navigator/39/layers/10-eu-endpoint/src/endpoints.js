// Named RateBridge endpoints. config/service.json selects one by name.
export const ENDPOINTS = {
  'rates-global': 'https://api.ratebridge.net/v2',
  'rates-eu': 'https://eu.api.ratebridge.net/v2',
  'rates-sandbox': 'https://sandbox.api.ratebridge.net/v2',
};

export function resolveEndpoint(name) {
  const url = ENDPOINTS[name];
  if (!url) throw new Error(`Unknown rates endpoint: ${name}`);
  return url;
}
