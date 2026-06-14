import type { DisplayPack } from '../lib/packs';

interface PricingCardProps {
  pack: DisplayPack;
  ctaLabel: string;
  onSelect: (packId: DisplayPack['id']) => void;
  busy?: boolean;
}

export function PricingCard({ pack, ctaLabel, onSelect, busy }: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col gap-5 rounded-card border bg-bg-card p-6 ${
        pack.highlighted ? 'border-accent' : 'border-border'
      }`}
    >
      {pack.highlighted && (
        <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-black">
          Most popular
        </span>
      )}

      <div>
        <h3 className="font-display text-xl font-bold">{pack.name}</h3>
        <p className="mt-1 text-sm text-text-muted">{pack.blurb}</p>
      </div>

      <div className="flex items-end gap-2">
        <span className="font-display text-4xl font-bold">{pack.price}</span>
        <span className="pb-1 text-sm text-text-muted">one-time</span>
      </div>

      <ul className="space-y-2 text-sm text-text-primary">
        <li className="flex items-center gap-2">
          <Check /> {pack.credits} credits
        </li>
        <li className="flex items-center gap-2">
          <Check /> {pack.credits * 3} scripts total
        </li>
        <li className="flex items-center gap-2">
          <Check /> Credits never expire
        </li>
      </ul>

      <button
        type="button"
        onClick={() => onSelect(pack.id)}
        disabled={busy}
        className={
          pack.highlighted
            ? 'btn-primary mt-auto w-full'
            : 'btn-ghost mt-auto w-full'
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
      className="shrink-0 text-accent"
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
