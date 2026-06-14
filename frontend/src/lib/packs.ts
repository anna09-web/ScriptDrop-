export type BillingInterval = 'month' | 'year';

export const ANNUAL_DISCOUNT = 0.2; // 20% off when billed annually

export interface Plan {
  id: 'starter' | 'creator' | 'pro';
  name: string;
  /** Price per month when billed monthly, in cents. */
  monthlyCents: number;
  /** Script generations included per month (each = 3 scripts). */
  monthlyGenerations: number;
  blurb: string;
  features: string[];
  highlighted: boolean;
}

// Display-only. The backend (backend/src/lib/plans.ts) is the source of truth
// for the amounts actually charged.
export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyCents: 1900,
    monthlyGenerations: 25,
    blurb: 'For getting consistent. 25 script sets a month.',
    features: [
      '25 generations / mo (75 scripts)',
      'Hook Analyzer',
      'Hashtag Generator',
      'Best Time to Post',
      'Unlimited Idea Spinner',
    ],
    highlighted: false,
  },
  {
    id: 'creator',
    name: 'Creator',
    monthlyCents: 3900,
    monthlyGenerations: 75,
    blurb: 'For posting every day. 75 script sets a month.',
    features: [
      '75 generations / mo (225 scripts)',
      'Everything in Starter',
      'View Analyzer',
      'Priority generation',
    ],
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyCents: 7900,
    monthlyGenerations: 200,
    blurb: 'For agencies and heavy posters. 200 a month.',
    features: [
      '200 generations / mo (600 scripts)',
      'Everything in Creator',
      'Manage multiple products',
      'Early access to new tools',
    ],
    highlighted: false,
  },
];

/** Effective price per month in cents for the chosen billing interval. */
export function monthlyEquivalentCents(plan: Plan, interval: BillingInterval): number {
  if (interval === 'year') {
    return Math.round(plan.monthlyCents * (1 - ANNUAL_DISCOUNT));
  }
  return plan.monthlyCents;
}

/** Total charged up front in cents for the chosen interval. */
export function totalCents(plan: Plan, interval: BillingInterval): number {
  if (interval === 'year') {
    return Math.round(plan.monthlyCents * 12 * (1 - ANNUAL_DISCOUNT));
  }
  return plan.monthlyCents;
}

export function formatUsd(cents: number): string {
  const dollars = cents / 100;
  const hasCents = Math.round(cents) % 100 !== 0;
  return `$${dollars.toLocaleString('en-US', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export const PLATFORMS = ['TikTok', 'Instagram Reels', 'YouTube Shorts'] as const;

export const HOOK_STYLES = [
  'Problem/Solution',
  'Storytime',
  'Shocking Stat',
  'Hot Take',
  'Before/After',
  'POV',
] as const;

export const TONES = [
  'Casual & Relatable',
  'Energetic & Hype',
  'Calm & Trustworthy',
  'Funny & Sarcastic',
] as const;
