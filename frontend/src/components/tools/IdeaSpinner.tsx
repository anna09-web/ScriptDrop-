import { useState } from 'react';
import { Link } from 'react-router-dom';
import { spinIdeas } from '../../lib/toolkit';
import { CopyButton } from '../CopyButton';

const SPIN_KEY = 'scriptdrop_free_spins';

interface IdeaSpinnerProps {
  /** When set, caps free usage at this many spins (persisted locally). */
  freeLimit?: number;
  /** Where the upgrade CTA points once the free limit is hit. */
  upgradeHref?: string;
}

export function IdeaSpinner({ freeLimit, upgradeHref = '/signup' }: IdeaSpinnerProps) {
  const limited = freeLimit !== undefined;

  const [topic, setTopic] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [used, setUsed] = useState<number>(() => {
    if (!limited) return 0;
    return Number(localStorage.getItem(SPIN_KEY) ?? '0');
  });

  const locked = limited && used >= (freeLimit ?? 0);
  const remaining = limited ? Math.max(0, (freeLimit ?? 0) - used) : Infinity;

  const spin = () => {
    if (locked || topic.trim().length < 2) return;
    setIdeas(spinIdeas(topic, 10));
    if (limited) {
      const next = used + 1;
      setUsed(next);
      localStorage.setItem(SPIN_KEY, String(next));
    }
  };

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold">Content Idea Spinner</h2>
            <p className="mt-1 text-sm text-text-muted">
              Stuck on what to film? Spin up ten angle ideas for any product in a
              click.
            </p>
          </div>
          {limited && !locked && (
            <span className="rounded-full border border-border bg-bg-elevated px-3 py-1 text-xs text-text-muted">
              {remaining} free {remaining === 1 ? 'spin' : 'spins'} left
            </span>
          )}
        </div>

        {locked ? (
          <Paywall upgradeHref={upgradeHref} />
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && spin()}
              className="input-field"
              placeholder="Your product or niche, e.g. protein coffee"
              maxLength={80}
            />
            <button type="button" onClick={spin} className="btn-primary">
              {ideas.length > 0 ? 'Spin again' : 'Spin ideas'}
            </button>
          </div>
        )}
      </section>

      {ideas.length > 0 && (
        <section className="grid animate-fade-in gap-3 sm:grid-cols-2">
          {ideas.map((idea, i) => (
            <div
              key={`${idea}-${i}`}
              className="card flex items-start justify-between gap-3 p-4"
            >
              <p className="text-sm leading-relaxed">{idea}</p>
              <CopyButton value={idea} />
            </div>
          ))}
        </section>
      )}

      {locked && ideas.length > 0 && (
        <p className="text-center text-sm text-text-muted">
          That’s your last free spin — the ideas above are yours to keep.
        </p>
      )}
    </div>
  );
}

function Paywall({ upgradeHref }: { upgradeHref: string }) {
  return (
    <div className="mt-6 flex flex-col items-center rounded-card border border-danger/40 bg-bg-elevated p-8 text-center">
      <StopSign />
      <p className="mt-4 font-display text-xl font-bold">You’ve used your 3 free spins.</p>
      <p className="mt-2 max-w-sm text-text-muted">
        Unlock unlimited idea spins — plus the Hook Analyzer, Hashtag Generator,
        Best Time to Post, and the AI script writer — with any plan.
      </p>
      <Link to={upgradeHref} className="btn-primary mt-6">
        See the plans
      </Link>
    </div>
  );
}

function StopSign() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden>
      <polygon
        points="20,4 44,4 60,20 60,44 44,60 20,60 4,44 4,20"
        fill="#FF4444"
      />
      <rect x="14" y="28" width="36" height="8" rx="2" fill="#fff" />
    </svg>
  );
}
