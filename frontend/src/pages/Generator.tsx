import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ScriptCard } from '../components/ScriptCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { HookAnalyzer } from '../components/tools/HookAnalyzer';
import { HashtagGenerator } from '../components/tools/HashtagGenerator';
import { IdeaSpinner } from '../components/tools/IdeaSpinner';
import { BestTimes } from '../components/tools/BestTimes';
import { ViewAnalyzer } from '../components/tools/ViewAnalyzer';
import { useCredits } from '../hooks/useCredits';
import { useToast } from '../components/Toast';
import { api, ApiError, type Script } from '../lib/api';
import { HOOK_STYLES, PLATFORMS, TONES } from '../lib/packs';

const MAX_CHARS = 500;

type Tab = 'scripts' | 'hooks' | 'hashtags' | 'ideas' | 'times' | 'views';

const TABS: { id: Tab; label: string }[] = [
  { id: 'scripts', label: 'Script Generator' },
  { id: 'hooks', label: 'Hook Analyzer' },
  { id: 'hashtags', label: 'Hashtags' },
  { id: 'ideas', label: 'Idea Spinner' },
  { id: 'times', label: 'Best Times' },
  { id: 'views', label: 'View Analyzer' },
];

export default function Generator() {
  const { refresh } = useCredits();
  const { notify } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>('scripts');

  // Show a toast and refresh after a successful Stripe checkout redirect.
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      notify('Credits added!', 'success');
      void refresh();
      searchParams.delete('success');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppLayout>
      {/* Tab bar */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative -mb-px px-4 py-3 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'border-b-2 border-accent text-text-primary'
                : 'border-b-2 border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'scripts' && <ScriptGenerator />}
      {tab === 'hooks' && <HookAnalyzer />}
      {tab === 'hashtags' && <HashtagGenerator />}
      {tab === 'ideas' && <IdeaSpinner />}
      {tab === 'times' && <BestTimes />}
      {tab === 'views' && <ViewAnalyzer />}
    </AppLayout>
  );
}

function ScriptGenerator() {
  const { profile, refresh } = useCredits();
  const { notify } = useToast();

  const [product, setProduct] = useState('');
  const [platform, setPlatform] = useState<string>(PLATFORMS[0]);
  const [hookStyle, setHookStyle] = useState<string>(HOOK_STYLES[0]);
  const [tone, setTone] = useState<string>(TONES[0]);

  const [loading, setLoading] = useState(false);
  const [scripts, setScripts] = useState<Script[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const credits = profile?.credits ?? 0;
  const outOfCredits = credits < 1;

  const onGenerate = async () => {
    setError(null);

    const trimmed = product.trim();
    if (trimmed.length < 3) {
      setError('Tell us a little more about what you’re promoting.');
      return;
    }
    if (outOfCredits) return;

    setLoading(true);
    setScripts(null);
    try {
      const result = await api.generate({ product: trimmed, platform, hookStyle, tone });
      setScripts(result.scripts);
      await refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        setError('You’ve used your generations for this period. Upgrade your plan to keep going.');
        await refresh();
      } else {
        const message =
          err instanceof Error ? err.message : 'Could not generate scripts.';
        setError(message);
        notify(message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      {/* Generator panel */}
      <section className="card h-fit p-6">
        <h1 className="font-display text-2xl font-bold">New scripts</h1>
        <p className="mt-1 text-sm text-text-muted">
          One credit, three scripts. About 30 seconds.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="product" className="mb-1 block text-sm text-text-muted">
              Paste your product URL or describe what you’re selling
            </label>
            <textarea
              id="product"
              value={product}
              maxLength={MAX_CHARS}
              onChange={(e) => setProduct(e.target.value)}
              rows={5}
              className="input-field resize-none"
              placeholder="e.g. A refillable glass water bottle that keeps drinks cold for 24 hours…"
            />
            <div className="mt-1 text-right text-xs text-text-faint">
              {product.length}/{MAX_CHARS}
            </div>
          </div>

          <Select
            id="platform"
            label="Platform"
            value={platform}
            onChange={setPlatform}
            options={PLATFORMS}
          />
          <Select
            id="hook"
            label="Hook style"
            value={hookStyle}
            onChange={setHookStyle}
            options={HOOK_STYLES}
          />
          <Select id="tone" label="Tone" value={tone} onChange={setTone} options={TONES} />

          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          {outOfCredits ? (
            <Link to="/pricing" className="btn-primary w-full">
              See plans
            </Link>
          ) : (
            <button
              type="button"
              onClick={onGenerate}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Writing…' : 'Generate scripts (1 credit)'}
            </button>
          )}
        </div>
      </section>

      {/* Output area */}
      <section className="relative min-h-[320px]">
        {loading ? (
          <SkeletonLoader />
        ) : scripts ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {scripts.map((script, i) => (
              <ScriptCard key={`${script.title}-${i}`} script={script} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}

        {outOfCredits && !scripts && !loading && <Paywall />}
      </section>
    </div>
  );
}

function Select({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm text-text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field cursor-pointer appearance-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-bg-elevated">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-card border border-dashed border-border p-10 text-center">
      <p className="font-display text-xl font-bold">Your scripts show up here.</p>
      <p className="mt-2 max-w-sm text-text-muted">
        Describe your product on the left, pick a hook, and hit generate. You’ll
        get three options to choose from.
      </p>
    </div>
  );
}

function Paywall() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-card border border-border bg-bg/80 p-10 text-center backdrop-blur-sm">
      <p className="font-display text-xl font-bold">You’re out of generations.</p>
      <p className="mt-2 max-w-sm text-text-muted">
        You’ve used everything in this billing period. Upgrade for more — or your
        plan refills at the start of the next cycle.
      </p>
      <Link to="/pricing" className="btn-primary mt-6">
        See plans
      </Link>
    </div>
  );
}
