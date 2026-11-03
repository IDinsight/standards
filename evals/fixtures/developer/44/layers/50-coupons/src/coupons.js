// Percentage coupons accepted at checkout, keyed by code.
export const COUPONS = {
  SAVE10: 10,
  SAVE15: 15,
  STAFF25: 25,
};

export function couponPercent(code) {
  const key = code.trim().toUpperCase();
  if (!Object.hasOwn(COUPONS, key)) {
    throw new RangeError(`unknown coupon ${code}`);
  }
  return COUPONS[key];
}
