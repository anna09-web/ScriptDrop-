import type { BillingInterval } from '../lib/packs';

interface IntervalToggleProps {
  interval: BillingInterval;
  onChange: (interval: BillingInterval) => void;
}

export function IntervalToggle({ interval, onChange }: IntervalToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-bg-card p-1">
      <button
        type="button"
        onClick={() => onChange('month')}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          interval === 'month'
            ? 'bg-bg-elevated text-text-primary'
            : 'text-text-muted hover:text-text-primary'
        }`}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange('year')}
        className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          interval === 'year'
            ? 'bg-bg-elevated text-text-primary'
            : 'text-text-muted hover:text-text-primary'
        }`}
      >
        Annual
        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">
          –20%
        </span>
      </button>
    </div>
  );
}
