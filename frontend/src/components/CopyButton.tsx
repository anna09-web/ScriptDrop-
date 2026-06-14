import { useState } from 'react';

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label = 'Copy', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={
        className ??
        'rounded-full border border-border px-3 py-1 text-xs font-medium text-text-muted transition-colors duration-150 hover:border-accent hover:text-accent'
      }
    >
      {copied ? 'Copied' : label}
    </button>
  );
}
