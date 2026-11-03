const round = (value) => Math.round(value * 100) / 100;

export async function buildQuote(provider, { sku, region, qty }) {
  const [rate, fee] = await Promise.all([provider.rates(sku), provider.fees(region)]);
  const subtotal = round(rate.unitPrice * qty);
  return {
    sku,
    region,
    qty,
    currency: rate.currency,
    subtotal,
    fee: fee.amount,
    total: round(subtotal + fee.amount),
  };
}
