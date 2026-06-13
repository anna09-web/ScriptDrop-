import { useState } from 'react';
import type { Script } from '../lib/api';

interface ScriptCardProps {
  script: Script;
}

export function ScriptCard({ script }: ScriptCardProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(script.script);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="card flex h-full flex-col gap-4 p-5">
      <header className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-bold leading-tight">
          {script.title}
        </h3>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-medium text-text-muted transition-colors duration-150 hover:border-accent hover:text-accent"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </header>

      <div className="rounded-lg border border-border bg-bg-elevated px-3 py-2">
        <span className="text-[11px] uppercase tracking-wide text-accent">
          Visual cue
        </span>
        <p className="mt-1 text-sm text-text-primary">{script.visual_cue}</p>
      </div>

      <p className="flex-1 whitespace-pre-line text-sm leading-relaxed text-text-primary">
        {script.script}
      </p>

      <footer className="flex items-center gap-4 border-t border-border pt-3 text-xs text-text-muted">
        <span>{script.word_count} words</span>
        <span aria-hidden>·</span>
        <span>{script.estimated_duration}</span>
      </footer>
    </article>
  );
}
