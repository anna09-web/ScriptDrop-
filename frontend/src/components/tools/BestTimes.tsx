import { useState } from 'react';
import { BEST_TIMES, type Platform } from '../../lib/toolkit';
import { PLATFORMS } from '../../lib/packs';

export function BestTimes() {
  const [platform, setPlatform] = useState<Platform>('TikTok');
  const rows = BEST_TIMES[platform];

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold">Best Time to Post</h2>
            <p className="mt-1 text-sm text-text-muted">
              General engagement windows in your local time. A starting point —
              your own audience data always wins.
            </p>
          </div>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="input-field cursor-pointer sm:w-48"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p} className="bg-bg-elevated">
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 divide-y divide-border">
          {rows.map((row) => (
            <div key={row.day} className="flex items-center gap-4 py-3">
              <span className="w-12 shrink-0 font-display font-bold text-text-primary">
                {row.day}
              </span>
              <div className="flex flex-wrap gap-2">
                {row.windows.map((w) => (
                  <span
                    key={w}
                    className="rounded-full border border-border bg-bg-elevated px-3 py-1 text-sm text-accent"
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
