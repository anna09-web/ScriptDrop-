function SkeletonCard() {
  return (
    <div className="card flex h-full flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="h-5 w-32 rounded bg-bg-elevated" />
        <div className="h-6 w-14 rounded-full bg-bg-elevated" />
      </div>
      <div className="h-14 rounded-lg bg-bg-elevated" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-bg-elevated" />
        <div className="h-3 w-11/12 rounded bg-bg-elevated" />
        <div className="h-3 w-full rounded bg-bg-elevated" />
        <div className="h-3 w-4/5 rounded bg-bg-elevated" />
        <div className="h-3 w-3/4 rounded bg-bg-elevated" />
      </div>
      <div className="mt-auto h-3 w-24 rounded bg-bg-elevated" />
    </div>
  );
}

export function SkeletonLoader() {
  return (
    <div
      className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Generating scripts"
    >
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
