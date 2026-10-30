export const PLANS = {
  starter: { id: 'starter', monthlyCents: 900 },
  team: { id: 'team', monthlyCents: 2900 },
  business: { id: 'business', monthlyCents: 9900 },
};

export function planPrice(planId) {
  const plan = PLANS[planId];
  if (!plan) throw new Error('unknown plan: ' + planId);
  return plan.monthlyCents;
}
