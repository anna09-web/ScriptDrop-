import {
  formatUsd,
  monthlyEquivalentCents,
  totalCents,
  type BillingInterval,
  type Plan,
} from '../lib/packs';

interface PricingCardProps {
  plan: Plan;
  interval: BillingInterval;
  ctaLabel: string;
  onSelect: (planId: Plan['id']) => void;
  busy?: boolean;
}

export function PricingCard({
  plan,
  interval,
  ctaLabel,
  onSelect,
  busy,
}: PricingCardProps) {
  const perMonth = monthlyEquivalentCents(plan, interval);

  return (
    <div
      className={`relative flex flex-col gap-5 rounded-card border bg-bg-card p-6 ${
        plan.highlighted ? 'border-accent' : 'border-border'
      }`}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-black">
          Most popular
        </span>
      )}

      <div>
        <h3 className="font-display text-xl font-bold">{plan.name}</h3>
        <p className="mt-1 text-sm text-text-muted">{plan.blurb}</p>
      </div>

      <div>
        <div className="flex items-end gap-2">
          <span className="font-display text-4xl font-bold">{formatUsd(perMonth)}</span>
          <span className="pb-1 text-sm text-text-muted">/mo</span>
        </div>
        <p className="mt-1 text-xs text-text-faint">
          {interval === 'year'
            ? `billed ${formatUsd(totalCents(plan, 'year'))} per year`
            : 'billed monthly · cancel anytime'}
        </p>
      </div>

      <ul className="space-y-2 text-sm text-text-primary">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check /> {feature}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onSelect(plan.id)}
        disabled={busy}
        className={
          plan.highlighted ? 'btn-primary mt-auto w-full' : 'btn-ghost mt-auto w-full'
        }
      >
        {busy ? 'Starting checkout…' : ctaLabel}
      </button>
    </div>
  );
}

function Check() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="mt-0.5 shrink-0 text-accent"
      aria-hidden
    >
      <path
        d="M13 4.5L6.5 11 3 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
