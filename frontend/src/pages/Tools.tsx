import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import { IdeaSpinner } from '../components/tools/IdeaSpinner';
import { useAuth } from '../hooks/useAuth';

export default function Tools() {
  const { session } = useAuth();

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
              {session ? 'Open app' : 'See the plans'}
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          Free to try
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Content Idea Spinner
        </h1>
        <p className="mt-3 max-w-xl text-text-muted">
          Spin up ten ready-to-film angles for any product — three times, on the
          house. The Hook Analyzer, Hashtag Generator, Best Time to Post, and the
          AI script writer come with any plan.
        </p>

        <div className="mt-8">
          <IdeaSpinner freeLimit={3} upgradeHref={session ? '/app' : '/signup'} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
