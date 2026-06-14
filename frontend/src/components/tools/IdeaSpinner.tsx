import { useState } from 'react';
import { spinIdeas } from '../../lib/toolkit';
import { CopyButton } from '../CopyButton';

export function IdeaSpinner() {
  const [topic, setTopic] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);

  const spin = () => {
    if (topic.trim().length < 2) return;
    setIdeas(spinIdeas(topic, 10));
  };

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h2 className="font-display text-xl font-bold">Content Idea Spinner</h2>
        <p className="mt-1 text-sm text-text-muted">
          Stuck on what to film? Spin up ten angle ideas for any product in a
          click. Local only — no AI credits used.
        </p>

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
    </div>
  );
}
