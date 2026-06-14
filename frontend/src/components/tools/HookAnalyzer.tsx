import { useMemo, useState } from 'react';
import { analyzeHook } from '../../lib/toolkit';

export function HookAnalyzer() {
  const [hook, setHook] = useState('');
  const analysis = useMemo(() => analyzeHook(hook), [hook]);
  const showResults = hook.trim().length > 0;

  const ringColor =
    analysis.score >= 80
      ? 'text-accent'
      : analysis.score >= 60
        ? 'text-accent'
        : analysis.score >= 40
          ? 'text-text-primary'
          : 'text-danger';

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <section className="card h-fit p-6">
        <h2 className="font-display text-xl font-bold">Hook Analyzer</h2>
        <p className="mt-1 text-sm text-text-muted">
          Paste your first line. We score it on the things that actually stop a
          scroll — no AI credits used.
        </p>
        <textarea
          value={hook}
          onChange={(e) => setHook(e.target.value)}
          rows={4}
          maxLength={200}
          className="input-field mt-4 resize-none"
          placeholder="e.g. Stop using concealer under your eyes until you watch this…"
        />
        <div className="mt-1 text-right text-xs text-text-faint">
          {hook.length}/200
        </div>
      </section>

      <section className="card p-6">
        {showResults ? (
          <>
            <div className="flex items-center gap-4">
              <div
                className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-border font-display text-2xl font-bold ${ringColor}`}
              >
                {analysis.score}
              </div>
              <div>
                <p className="font-display text-lg font-bold">{analysis.rating}</p>
                <p className="text-sm text-text-muted">
                  {analysis.wordCount} words · scored out of 100
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-2">
              {analysis.factors.map((f) => (
                <li key={f.label} className="flex items-start gap-3 text-sm">
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                      f.hit ? 'bg-accent text-black' : 'bg-bg-elevated text-text-faint'
                    }`}
                  >
                    {f.hit ? '✓' : '–'}
                  </span>
                  <span>
                    <span className="font-medium text-text-primary">{f.label}.</span>{' '}
                    <span className="text-text-muted">{f.detail}</span>
                  </span>
                </li>
              ))}
            </ul>

            {analysis.tips.length > 0 && (
              <div className="mt-5 rounded-lg border border-border bg-bg-elevated p-4">
                <p className="text-xs uppercase tracking-wide text-accent">
                  Make it stronger
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-muted">
                  {analysis.tips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
            <p className="font-display text-lg font-bold">Score shows up here.</p>
            <p className="mt-2 max-w-xs text-sm text-text-muted">
              Type a hook on the left to see its scroll-stopping score and how to
              improve it.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
