import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import { HookAnalyzer } from '../components/tools/HookAnalyzer';
import { HashtagGenerator } from '../components/tools/HashtagGenerator';
import { IdeaSpinner } from '../components/tools/IdeaSpinner';
import { BestTimes } from '../components/tools/BestTimes';
import { useAuth } from '../hooks/useAuth';

type Tab = 'hooks' | 'hashtags' | 'ideas' | 'times';

const TABS: { id: Tab; label: string }[] = [
  { id: 'hooks', label: 'Hook Analyzer' },
  { id: 'hashtags', label: 'Hashtags' },
  { id: 'ideas', label: 'Idea Spinner' },
  { id: 'times', label: 'Best Times' },
];

export default function Tools() {
  const { session } = useAuth();
  const [tab, setTab] = useState<Tab>('hooks');

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <nav className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden text-sm text-text-muted transition-colors hover:text-text-primary sm:inline"
            >
              Home
            </Link>
            <Link
              to={session ? '/app' : '/signup'}
              className="btn-primary px-5 py-2 text-sm"
            >
              {session ? 'Open app' : 'Get the script writer'}
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          Free creator tools
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Your filming toolkit — no account needed.
        </h1>
        <p className="mt-3 max-w-xl text-text-muted">
          These run right in your browser. No sign-up, no credits, no limits.
          When you’re ready to write full scripts, the AI generator is one click
          away.
        </p>

        <div className="my-8 flex flex-wrap gap-2 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`-mb-px px-4 py-3 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'border-b-2 border-accent text-text-primary'
                  : 'border-b-2 border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'hooks' && <HookAnalyzer />}
        {tab === 'hashtags' && <HashtagGenerator />}
        {tab === 'ideas' && <IdeaSpinner />}
        {tab === 'times' && <BestTimes />}
      </main>

      <Footer />
    </div>
  );
}
