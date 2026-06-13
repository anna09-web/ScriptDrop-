export interface CreditPack {
  id: 'starter' | 'creator' | 'pro';
  name: string;
  credits: number;
  amountCents: number;
}

/**
 * Canonical, server-side source of truth for pricing. The frontend may display
 * prices, but the backend never trusts a client-supplied amount — it looks the
 * pack up here by id when creating a Stripe Checkout session.
 */
export const CREDIT_PACKS: Record<CreditPack['id'], CreditPack> = {
  starter: { id: 'starter', name: 'Starter', credits: 5, amountCents: 900 },
  creator: { id: 'creator', name: 'Creator', credits: 15, amountCents: 1900 },
  pro: { id: 'pro', name: 'Pro', credits: 40, amountCents: 3900 },
};

export function getPack(id: string): CreditPack | undefined {
  if (id === 'starter' || id === 'creator' || id === 'pro') {
    return CREDIT_PACKS[id];
  }
  return undefined;
}
