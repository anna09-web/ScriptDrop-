interface CreditBadgeProps {
  credits: number | null;
  loading?: boolean;
}

export function CreditBadge({ credits, loading }: CreditBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-3 py-1.5 text-sm font-medium"
      title="Generations left in your current billing period. Each one produces 3 scripts."
    >
      <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
      {loading || credits === null ? (
        <span className="text-text-muted">—</span>
      ) : (
        <>
          <span className="text-text-primary">{credits}</span>
          <span className="text-text-muted">left</span>
        </>
      )}
    </span>
  );
}
