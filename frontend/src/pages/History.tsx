import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ScriptCard } from '../components/ScriptCard';
import { supabase } from '../lib/supabase';
import type { Script } from '../lib/api';

const PAGE_SIZE = 10;

interface Generation {
  id: string;
  product_input: string;
  hook_style: string;
  platform: string;
  scripts: Script[];
  created_at: string;
}

export default function History() {
  const [rows, setRows] = useState<Generation[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async (pageIndex: number) => {
    setLoading(true);
    setError(null);
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count, error: queryError } = await supabase
      .from('generations')
      .select('id, product_input, hook_style, platform, scripts, created_at', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (queryError) {
      setError('Could not load your history. Please refresh.');
      setLoading(false);
      return;
    }

    setRows((data ?? []) as Generation[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load(page);
  }, [page, load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AppLayout>
      <h1 className="font-display text-3xl font-bold">Your history</h1>
      <p className="mt-1 text-text-muted">Every generation you’ve made.</p>

      <div className="mt-8">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-card bg-bg-card" />
            ))}
          </div>
        ) : error ? (
          <p className="text-danger" role="alert">
            {error}
          </p>
        ) : rows.length === 0 ? (
          <EmptyHistory />
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const isOpen = expanded === row.id;
              return (
                <div key={row.id} className="card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : row.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-bg-elevated"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{row.product_input}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {formatDate(row.created_at)} · {row.platform} ·{' '}
                        {row.hook_style}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-accent transition-transform ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                    >
                      +
                    </span>
                  </button>

                  {isOpen && (
                    <div className="grid gap-4 border-t border-border p-4 sm:grid-cols-2 xl:grid-cols-3">
                      {row.scripts.map((script, i) => (
                        <ScriptCard key={`${row.id}-${i}`} script={script} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!loading && !error && rows.length > 0 && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-ghost px-4 py-2 text-sm"
          >
            Previous
          </button>
          <span className="text-sm text-text-muted">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="btn-ghost px-4 py-2 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </AppLayout>
  );
}

function EmptyHistory() {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border p-12 text-center">
      <p className="font-display text-xl font-bold">Nothing here yet.</p>
      <p className="mt-2 max-w-sm text-text-muted">
        Once you generate your first set of scripts, they’ll show up here so you
        can come back to them.
      </p>
      <Link to="/app" className="btn-primary mt-6">
        Generate scripts
      </Link>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
