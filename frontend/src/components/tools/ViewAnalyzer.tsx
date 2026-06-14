import { useState } from 'react';
import { analyzeVideo, type VideoAnalysis, type VideoStats } from '../../lib/toolkit';

type FieldKey = keyof VideoStats;

const FIELDS: { key: FieldKey; label: string; placeholder: string; suffix?: string }[] = [
  { key: 'views', label: 'Views', placeholder: '12000' },
  { key: 'likes', label: 'Likes', placeholder: '850' },
  { key: 'comments', label: 'Comments', placeholder: '40' },
  { key: 'shares', label: 'Shares', placeholder: '60' },
  { key: 'saves', label: 'Saves', placeholder: '120' },
  { key: 'follows', label: 'New follows', placeholder: '35' },
  { key: 'avgWatchPercent', label: 'Avg. watched', placeholder: '45', suffix: '%' },
];

const EMPTY: Record<FieldKey, string> = {
  views: '',
  likes: '',
  comments: '',
  shares: '',
  saves: '',
  follows: '',
  avgWatchPercent: '',
};

export function ViewAnalyzer() {
  const [fields, setFields] = useState<Record<FieldKey, string>>(EMPTY);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (key: FieldKey, value: string) => {
    // Digits only (allow empty); avg watched is also an integer percent.
    if (value !== '' && !/^\d+$/.test(value)) return;
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const analyze = () => {
    setError(null);
    const views = Number(fields.views || '0');
    if (views < 1) {
      setError('Enter your view count to analyze the video.');
      return;
    }
    setAnalysis(
      analyzeVideo({
        views,
        likes: Number(fields.likes || '0'),
        comments: Number(fields.comments || '0'),
        shares: Number(fields.shares || '0'),
        saves: Number(fields.saves || '0'),
        follows: Number(fields.follows || '0'),
        avgWatchPercent: Number(fields.avgWatchPercent || '0'),
      }),
    );
  };

  const ratingColor =
    analysis && analysis.score >= 55 ? 'text-accent' : 'text-danger';

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <section className="card h-fit p-6">
        <h2 className="font-display text-xl font-bold">View Analyzer</h2>
        <p className="mt-1 text-sm text-text-muted">
          Drop in a video’s stats and get a read on what worked and what to fix
          next time. Runs locally — no AI credits used.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label
                htmlFor={f.key}
                className="mb-1 block text-sm text-text-muted"
              >
                {f.label}
                {f.suffix ? ` (${f.suffix})` : ''}
              </label>
              <input
                id={f.key}
                inputMode="numeric"
                value={fields[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && analyze()}
                className="input-field"
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-3 text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <button type="button" onClick={analyze} className="btn-primary mt-5 w-full">
          Analyze video
        </button>
      </section>

      <section className="card p-6">
        {analysis ? (
          <>
            <div className="flex items-center gap-4">
              <div
                className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-border font-display text-2xl font-bold ${ratingColor}`}
              >
                {analysis.score}
              </div>
              <div>
                <p className="font-display text-lg font-bold">{analysis.rating}</p>
                <p className="text-sm text-text-muted">Performance score / 100</p>
              </div>
            </div>

            <ul className="mt-5 space-y-2">
              {analysis.metrics.map((m) => (
                <li key={m.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-text-muted">{m.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">{m.value}</span>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        m.verdict === 'good'
                          ? 'bg-accent'
                          : m.verdict === 'ok'
                            ? 'bg-text-muted'
                            : 'bg-danger'
                      }`}
                    />
                  </span>
                </li>
              ))}
            </ul>

            {analysis.wins.length > 0 && (
              <div className="mt-5">
                <p className="text-xs uppercase tracking-wide text-accent">
                  What went well
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-muted">
                  {analysis.wins.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.fixes.length > 0 && (
              <div className="mt-4 rounded-lg border border-border bg-bg-elevated p-4">
                <p className="text-xs uppercase tracking-wide text-danger">
                  Fix next time
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-muted">
                  {analysis.fixes.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
            <p className="font-display text-lg font-bold">Your breakdown shows up here.</p>
            <p className="mt-2 max-w-xs text-sm text-text-muted">
              Enter your stats on the left to see what worked and what to change.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
