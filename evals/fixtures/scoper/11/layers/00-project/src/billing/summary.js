import { COPY } from './copy.js';

export function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

// account: { planName, monthlyPriceCents, renewsOn } where renewsOn is a
// calendar date string such as '2026-09-30'.
export function renderBillingSummary(account) {
  return [
    `# ${COPY.heading}`,
    `${COPY.planLabel}: ${account.planName}`,
    `${formatPrice(account.monthlyPriceCents)} ${COPY.priceSuffix}`,
    `${COPY.renewalPrefix} ${account.renewsOn}`,
    `[${COPY.cancelButton}]`,
  ].join('\n');
}
