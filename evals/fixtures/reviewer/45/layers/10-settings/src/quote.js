import { roundCents } from './money.js';
import { loadSettings } from './settings.js';
import { shippingCost, subtotal } from './shipping.js';

const BUNDLED = new URL('../config/shipping.json', import.meta.url);

export function quote(order, settingsPath = BUNDLED) {
  const settings = loadSettings(settingsPath);
  const items = subtotal(order);
  const shipping = shippingCost(order, settings);
  return { currency: settings.currency, subtotal: items, shipping, total: roundCents(items + shipping) };
}
