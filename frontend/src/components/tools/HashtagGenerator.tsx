import { useState } from 'react';
import { generateHashtags, type HashtagSet, type Platform } from '../../lib/toolkit';
import { CopyButton } from '../CopyButton';
import { PLATFORMS } from '../../lib/packs';

export function HashtagGenerator() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>('TikTok');
  const [result, setResult] = useState<HashtagSet | null>(null);

  const onGenerate = () => {
    if (topic.trim().length < 2) return;
    setResult(generateHashtags(topic, platform));
  };

  const allTags = result
    ? [...result.broad, ...result.niche, ...result.micro].join(' ')
    : '';

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h2 className="font-display text-xl font-bold">Hashtag Generator</h2>
        <p className="mt-1 text-sm text-text-muted">
          A balanced mix of broad, niche, and long-tail tags so you’re not just
          shouting into #fyp. Runs locally — no AI credits used.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
            className="input-field"
            placeholder="What’s the video about? e.g. glass water bottle"
            maxLength={80}
          />
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
          <button type="button" onClick={onGenerate} className="btn-primary">
            Generate
          </button>
        </div>
      </section>

      {result && (
        <section className="card animate-fade-in p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Your hashtag mix</h3>
            <CopyButton
              value={allTags}
              label="Copy all"
              className="btn-primary px-4 py-1.5 text-xs"
            />
          </div>

          <TagGroup
            title="Broad reach"
            hint="High volume, high competition"
            tags={result.broad}
          />
          <TagGroup
            title="Niche"
            hint="Your topic + intent"
            tags={result.niche}
          />
          <TagGroup
            title="Long-tail"
            hint="Lower competition, higher intent"
            tags={result.micro}
          />
        </section>
      )}
    </div>
  );
}

function TagGroup({
  title,
  hint,
  tags,
}: {
  title: string;
  hint: string;
  tags: string[];
}) {
  if (tags.length === 0) return null;
  return (
    <div className="mt-5">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="text-xs text-text-faint">{hint}</p>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border bg-bg-elevated px-3 py-1 text-sm text-text-primary"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
