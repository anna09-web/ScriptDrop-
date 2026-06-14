export type BillingInterval = 'month' | 'year';

export const ANNUAL_DISCOUNT = 0.2; // 20% off when billed annually

export interface Plan {
  id: 'starter' | 'creator' | 'pro';
  name: string;
  /** Price per month when billed monthly, in cents. */
  monthlyCents: number;
  /** Generations granted at the start of each billing period. */
  monthlyGenerations: number;
}

/**
 * Canonical, server-side source of truth for plans. The backend never trusts a
 * client-supplied amount — it looks the plan up here by id and computes the
 * charge for the requested interval.
 */
export const PLANS: Record<Plan['id'], Plan> = {
  starter: { id: 'starter', name: 'Starter', monthlyCents: 1900, monthlyGenerations: 25 },
  creator: { id: 'creator', name: 'Creator', monthlyCents: 3900, monthlyGenerations: 75 },
  pro: { id: 'pro', name: 'Pro', monthlyCents: 7900, monthlyGenerations: 200 },
};

export function getPlan(id: string): Plan | undefined {
  if (id === 'starter' || id === 'creator' || id === 'pro') {
    return PLANS[id];
  }
  return undefined;
}

export function isInterval(value: unknown): value is BillingInterval {
  return value === 'month' || value === 'year';
}

/** Amount charged per billing period (in cents) for the given interval. */
export function amountForInterval(plan: Plan, interval: BillingInterval): number {
  if (interval === 'year') {
    return Math.round(plan.monthlyCents * 12 * (1 - ANNUAL_DISCOUNT));
  }
  return plan.monthlyCents;
}
